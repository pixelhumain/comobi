//jshint esversion: 6
class Connection{
	constructor(){
		this._stream = {
			on:()=>{}
		}
	}
}
class Streamer {
	constructor( _id ){
		this._id = _id;
	}
	on( type, callback ){

	}
}

export default new class {

	constructor(){
		this.callWithError = false;
		this.Streamer = Streamer;
		this.connection = new Connection();
	}
	userId(){
		return "fake_user_id";
	}
	subscribe( subName ){
		console.log("sub name", subName);
	}

	/**
	 * Fake a call to Meteor.call. Simply returns the arguments
	 * @returns {Arguments}
	 */
	call( ){
		return arguments;
	}
};

