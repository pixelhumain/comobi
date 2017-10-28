const video = {

};

const element = {

};

//jshint esversion: 6
export default new class {
	createElement( type ){
		switch( type ){
			case 'video':
				return video;
			default:
				return element;
		}
	}
};