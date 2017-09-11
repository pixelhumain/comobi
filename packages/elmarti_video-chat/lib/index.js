import { Meteor } from 'meteor/meteor';
import { Client } from './client';
import { Services } from './server';

import CallLog from './call_log';
console.log("got it", Meteor.isClient, Meteor.isServer);
if( Meteor.isClient ){
	console.log("loading client");
	Meteor.VideoCallServices = new Client();
}
if( Meteor.isServer ){
	console.log("loading server");
	Meteor.users.find({"status.online": true}).observe({
		removed: function ({_id}) {
			CallLog.find({
				$or: [{
					status: {
						$ne: 'FINISHED'
					},
					target: _id
				}, {
					status: {
						$ne: 'FINISHED'
					},
					caller: _id
				}]
			}).forEach(call =>
				CallLog.update({
					_id: call._id
				}, {
					$set: {
						status: 'FINISHED'
					}
				}));
		}
	});
	Meteor.methods({
		'VideoCallServices/call': Services.call,
		'VideoCallServices/answer': Services.answer,
		'VideoCallServices/end': Services.end
	});
	Meteor.VideoCallServices = {
		/**
		 * Callback envoked on error
		 * @param err {Error}
		 * @param data {Object}
		 * @param user {Object}
		 */
		onError(err, data, user){}
	};
}