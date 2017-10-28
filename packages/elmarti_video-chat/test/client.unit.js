//jshint esversion: 6
import { Client } from '../lib/client';
import chai, { assert, expect } from 'chai';
import spies from 'chai-spies';
chai.use(spies);
//fake objects
import meteor from './meteor';
import { Video as video } from '../lib/video';
import tracker from './tracker';
import document from './document';

const should = chai.should();
describe( 'Meteor Video Chat client', () => {


	it( 'should create the MeteorVideoChat object', () => {
		const client = new Client({ meteor, video, tracker });
		assert.isDefined(client);
	});
	const callArgs = [{
		text:'no local video',
		remote: document.createElement( 'video' )
	},{
		text: 'no remote video',
		local: document.createElement( 'video' )
	},{
		text: 'no video at all'
	}, {
		text: 'all video',
		local: document.createElement( 'video' ),
		remote: document.createElement( 'video' )
	}]
	callArgs.forEach( args => {
		const description = 'calling the target user with ' + args.text;
		const callbackSpy = chai.spy.on(meteor, 'call');
		const client = new Client({ meteor, video, tracker });
		describe( description, () => {
			const callArgs = client.call( 'targetRemoteUser', args.local, args.remote );
			it( 'should correctly set the call video data', () => {
				if(args.remote){
					assert.isDefined(client.remoteVideo);
				} else {
					assert.isUndefined(client.remoteVideo);
				}
				if(args.local){
					assert.isDefined(client.localVideo);
				} else {
					assert.isUndefined(client.localVideo);
				}
			} );
			it( 'should call the correct meteor method', () => {
				expect(callbackSpy).to.have.been.called();
			});
		});
	});

	describe( 'DDP stream handler should function as expected', () => {


		const endOfCall = JSON.stringify({
			msg: "removed",
			collection: "VideoChatCallLog"
		});
		describe( 'end of call data ' + endOfCall, () => {
			const client = new Client({ meteor, video, tracker });
			const spy = chai.spy.on(client, 'onTerminateCall');
			client.handleStream(endOfCall);
			it( 'should call the onTerminateCall callback', () => {

				expect(spy).to.have.been.called();
			});
		});

		const recievingNewCall = JSON.stringify({
			msg: "added",
			collection: "VideoChatCallLog",
			fields:{
				target : meteor.userId(),
				status : "NEW",
				caller : "target_caller_id"
			}
		});
		describe( 'recieving a new call with ' + recievingNewCall, () => {
			const client = new Client({ meteor, video, tracker });
			const streamSpy = chai.spy.on( meteor, 'Streamer' );
			const onReceivePhoneCallSpy = chai.spy.on( client, 'onReceivePhoneCall' );
			client.handleStream(recievingNewCall);
			it( 'should create the target stream', () => {
				expect(streamSpy).to.have.been.called();
			});
			it( 'should call the onReceivePhoneCall callback', () => {
				expect(onReceivePhoneCallSpy).to.have.been.called( );
			});
		});



		const targetAcceptsPhoneCall = JSON.stringify({
			msg: "changed",
			collection: "VideoChatCallLog",
			fields:{
				caller : meteor.userId(),
				status : "ACCEPTED",
			}
		});

		//navigator needs to be abstracted or faked for this to work
		// describe( 'target accepts phone call with ' + targetAcceptsPhoneCall, () => {
		// 	const onTargetAcceptSpy = chai.spy.on( client, 'onTargetAccept' );
		// 	const handleTargetAcceptSpy = chai.spy.on( client, 'handleTargetAccept' );
		// 	client.callLog = {
		// 		caller: meteor.userId()
		// 	};
		// 	client.handleStream(targetAcceptsPhoneCall);
		// 	it( 'should called onTargetAccept', () => {
		// 		expect(onTargetAcceptSpy).to.have.been.called();
		// 	});
		// 	it( 'should call the onReceivePhoneCall callback', () => {
		// 		expect(handleTargetAcceptSpy).to.have.been.called( );
		// 	});
		// });


	});


});
