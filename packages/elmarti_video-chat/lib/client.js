//jshint esversion: 6
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Video } from './video';
class Client {
	RTCConfiguration = {};
	RetryLimit = 5;
	RetryCount = 0;
	constructor() {
		Tracker.autorun( () => {
			this.sub = Meteor.subscribe( 'VideoChatPublication' );
		} );
		let callLog;
		Meteor.connection._stream.on( 'message', ( msg ) => {

			msg = JSON.parse( msg );
			if ( msg.collection === 'VideoChatCallLog'
				&& msg.msg === 'removed' ) {
				this.onTerminateCall();
			}
			if ( msg.collection === 'VideoChatCallLog'
				&& msg.msg === 'added'
				&& msg.fields.target === Meteor.userId()
				&& msg.fields.status === "NEW" ) {
				callLog = msg.fields;
				this.stream = new Meteor.Streamer( msg.id );
				this.stream.on( 'video_message', ( stream_data ) => {
					if ( typeof stream_data === "string" ) {
						stream_data = JSON.parse( stream_data );
					}
					if ( stream_data.offer ) {
						navigator.mediaDevices.getUserMedia( { audio: true, video: true } ).then( stream => {
							if ( this.localVideo ) {
								this.localVideo.setStream(stream, true);
								this.localVideo.play();
							}
							this.setupPeerConnection( stream, stream_data.offer );
						} ).catch( err => {
							this.onError( err, stream_data )
						} );
					}
					if ( stream_data.candidate ) {
						if ( typeof stream_data.candidate === "string" )
							stream_data.candidate = JSON.parse( stream_data.candidate );
						console.log( stream_data.candidate );
						const candidate = stream_data.candidate === {}
						|| stream_data.candidate === null ? null : new RTCIceCandidate( stream_data.candidate );
						if ( this.peerConnection )
							this.peerConnection.addIceCandidate( candidate ).catch( err => {
								this.onError( err, stream_data );
							} );
					}
				} );
				this.onReceivePhoneCall( callLog.caller );
			}
			if ( msg.collection === 'VideoChatCallLog'
				&& msg.msg === 'added'
				&& msg.fields.caller === Meteor.userId()
				&& msg.fields.status === 'NEW' ) {
				callLog = msg.fields;
			}
			if ( msg.msg === 'changed'
				&& msg.collection === 'VideoChatCallLog'
				&& msg.fields !== undefined ) {
				const { fields } = msg;
				if ( fields.status === 'ACCEPTED' && callLog.caller === Meteor.userId() ) {
					this.onTargetAccept();
					navigator.mediaDevices.getUserMedia( { audio: true, video: true } ).then( stream => {
						if ( this.localVideo ) {
							this.localVideo.pause();
							this.localVideo.setStream( stream, true);
							this.localVideo.play();
						}
						this.setupPeerConnection( stream );
					} ).catch( err => {
						this.onError( err, msg );
					} );
				}
			}
		} );

	}

	/**5
	 * Set up the peer connection
	 * @param stream {MediaStream}
	 * @param remoteDescription {RTCPeerConnection}
	 */
	setupPeerConnection( stream, remoteDescription ) {
		this.peerConnection = new RTCPeerConnection( this.RTCConfiguration, { "optional": [ { 'googIPv6': false } ] } );
		this.onPeerConnectionCreated();
		this.setPeerConnectionCallbacks();
		this.peerConnection.addStream( stream );
		if ( remoteDescription )
			this.createTargetSession( remoteDescription );
		else
			this.createCallSession();
	}

	/**
	 * Set callback for RTCPeerConnection
	 */
	setPeerConnectionCallbacks() {
		this.peerConnection.onicecandidate = ( event ) => {

			if ( event.candidate === undefined ) {
				event.candidate = {};
			}
			this.stream.emit( 'video_message', { candidate: JSON.stringify( event.candidate ) } );
		};
		this.peerConnection.oniceconnectionstatechange = ( event ) => {
		    if( event.target.iceConnectionState === "failed" ){
		        this.peerConnection = undefined;
		        if(this.RetryCount < this.RetryLimit) {
                    navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream => {
                    	this.RetryCount++;
                        if (this.localVideo) {
                        	this.localVideo.pause();
                        	this.localVideo.setStream( stream, true );
							this.localVideo.play();
                        }
                        this.setupPeerConnection(stream);
                    }).catch(err => {
                        this.onError(err, msg);
                    });
                } else {
		            const error = new Error(408, "Could not establish connection");
		            this.onError(error);
                }

            }
			console.log( event );
		};
		this.peerConnection.onaddstream = function ( stream ) {
			if ( this.remoteVideo ) {
				this.remoteVideo.pause();
				this.remoteVideo.setStream(stream.stream);
				this.remoteVideo.play();
			}
		}.bind( this );
	}

	/**
	 * Create the RTCPeerConnection for the person being called
	 * @param remoteDescription {RemoteDescription}
	 */
	createTargetSession( remoteDescription ) {


		this.peerConnection.setRemoteDescription( remoteDescription ).then( () => {

			this.peerConnection.createAnswer().then( answer => {
				this.peerConnection.setLocalDescription( answer ).catch( err => {
					this.onError( err, answer );
				} );
				this.stream.emit( 'video_message', JSON.stringify( { answer } ) );
			} ).catch( err => {
				this.onError( err, remoteDescription );
			} );
		} ).catch( err => {
			this.onError( err, remoteDescription );
		} );

	}

	createCallSession() {
		this.peerConnection.createOffer().then( offer => {
            this.stream.emit( 'video_message', JSON.stringify( { offer } ) );
			this.peerConnection.setLocalDescription( offer ).catch( err => {
				this.onError( err, offer );
			} );

		} ).catch( err => this.onError( err ) );
	}

	/**
	 * Call allows you to call a remote user using their userId
	 * @param _id {string}
	 * @param local {HTMLElement}
	 * @remote remote {HTMLElement}
	 */
	call( _id, local, remote ) {
	    this.RetryCount = 0;
		if ( local )
			this.localVideo = new Video( local );
		if ( remote )
			this.remoteVideo = new Video( remote );
		Meteor.call( 'VideoCallServices/call', _id, ( err, _id ) => {
			this.RetryCount++;
			if ( err )
				this.onError( err, _id );
			else {
				this.stream = new Meteor.Streamer( _id );
				this.stream.on( 'video_message', ( stream_data ) => {
					if ( typeof stream_data === 'string' )
						stream_data = JSON.parse( stream_data );
					if ( stream_data.answer ) {
						this.peerConnection.setRemoteDescription( stream_data.answer ).catch( err => {
							this.onError( err, stream_data )
						} );
					}

					if ( stream_data.candidate ) {
						if ( typeof stream_data.candidate === 'string' )
							stream_data.candidate = JSON.parse( stream_data.candidate );
						const candidate = stream_data.candidate === {}
						|| stream_data.candidate === null ? null : new RTCIceCandidate( stream_data.candidate );
						console.log( candidate );
						if ( this.peerConnection )
							this.peerConnection.addIceCandidate( stream_data.candidate ).catch( err => {
								this.onError( err, stream_data );
							} );
					}
				} );
			}
		} );
	}

	/**
	 * Answer the phone call
	 * @param local {HTMLElement}
	 * @param remote {HTMLElement}
	 */
	answerPhoneCall( local, remote ) {
		if ( local )
			this.localVideo = new Video( local );
		if ( remote )
			this.remoteVideo = new Video( remote );
		Meteor.call( 'VideoCallServices/answer', err => {
			if ( err )
				this.onError( err );
		} );
	}

	/**
	 * End the phone call
	 */
	endPhoneCall() {
		Meteor.call( "VideoCallServices/end", err => {
			if ( err )
				this.onError( err );
		} );
	}


	onTargetAccept() {

	}

	onReceivePhoneCall( fields ) {

	}

	onTerminateCall() {

	}

	onPeerConnectionCreated() {

	}

	onError( err ) {

	}
}


export {
	Client
};