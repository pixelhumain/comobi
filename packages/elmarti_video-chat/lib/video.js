class Video {
	/**
	 * Wrap video to allow stabler manipulation
	 * @param video {HTMLElement}
	 */
	constructor ( video ){
		this.onPlaying = false;
		this.onPause = false;
		if( !video ) {
			throw new Error( "Video element not found" );
		} else {
			this.element = video;
			this.element.onplaying = () => {
				this.onPlaying = true;
				this.onPause = false;
			};
			this.element.onpause = () => {
				this.onPlaying = false;
				this.onPause = true;
			};
		}
	}

	/**
	 * Pause the video element
	 */
	pause(){
		if (!this.element.paused && !this.onPause) {
			this.element.pause();
		}
	}

	/**
	 * Play the video element
	 */
	play(){
		if (this.element.paused && !this.onPlaying) {
			this.element.play().then(_ => {
				// Automatic playback started!
				// Show playing UI.
				// We can now safely pause video...
				console.log("video playing");
			})
				.catch(error => {
					// Auto-play was prevented
					// Show paused UI.
					console.log("video error", error);
				} );
		}
	}

	/**
	 * Set the video stream
	 * @param stream {MediaStream}
	 * @param muted {Boolean}
	 */
	setStream(stream, muted){
		this.element.srcObject = stream;
		if( muted !== undefined ) {
			this.element.muted = muted;
		} else {
			this.element.muted = false;
		}
	}
}
export {
	Video
};