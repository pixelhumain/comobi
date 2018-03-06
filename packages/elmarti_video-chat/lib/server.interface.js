import { Meteor } from 'meteor/meteor';
import { Services } from './server';

const VideoCallServices = {
  checkConnect(callback){
      Services.setCheckConnect(callback);
  },
  setOnError(callback){
      Services.setOnError(callback);
  }
};
Meteor.VideoCallServices = VideoCallServices;
export {
    VideoCallServices
};