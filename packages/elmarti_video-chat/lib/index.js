//jshint esversion: 6
import { Meteor } from 'meteor/meteor';
import { Client } from './client';
import { Services } from './server';
import { Tracker } from "meteor/tracker";
import { Video } from './video';

import CallLog from './call_log';

if( Meteor.isClient ){
	Meteor.VideoCallServices = new Client( {
		meteor: Meteor,
		tracker: Tracker,
		video: Video } );
}
if( Meteor.isServer ){
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