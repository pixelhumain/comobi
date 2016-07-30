import { Meteor } from 'meteor/meteor';
import { Push } from 'meteor/raix:push';
import { Router } from 'meteor/iron:router';

import { NotificationHistory } from '../../api/notification_history.js';

Meteor.startup(function () {
	if(Meteor.isCordova){
		let initNotifystart = NotificationHistory.find().observe({
			added: function(notification) {
				if(!initNotifystart) return ;
				//console.log(NotificationHistory.find({}).count());
				Push.setBadge(NotificationHistory.find({}).count());
			},
			changed: function(notification) {
				//console.log(NotificationHistory.find({}).count());
				Push.setBadge(NotificationHistory.find({}).count());
			},
			removed: function(notification) {
				//console.log(NotificationHistory.find({}).count());
				Push.setBadge(NotificationHistory.find({}).count());
			}
		});

		Push.Configure({
			android: {
				senderID: 501293889946,
				alert: true,
				badge: true,
				sound: true,
				vibrate: true,
				clearNotifications: true
				// icon: '',
				// iconColor: ''
			},
			ios: {
				alert: true,
				badge: true,
				sound: true
			}
		});

		Push.addListener('startup', function(notification) {
			Router.go('/notifications');
		});

		Push.addListener('message', function(notification) {
			function alertDismissed(buttonIndex) {
				if(buttonIndex===1){
					if(notification.payload.link){
						Meteor.call('markRead',notification.payload.notifId);
						Meteor.call('registerClick', notification.payload.notifId);
						Router.go(notification.payload.link);
					}else{
						Router.go('/notifications');
					}
				}
			}
			window.confirm(notification.message, alertDismissed, notification.payload.title, ["Voir","fermer"]);
		});

	}else{

		if (!("Notification" in window)) {
			alert("This browser does not support desktop notification");
		} else {

			if (Notification.permission !== 'denied') {
				Notification.requestPermission(function (permission) {
				});
			}

			if (Notification.permission === "granted") {
				var initNotifystart = NotificationHistory.find({'addedAt': {$gt: new Date()}}).observe({
					added: function(notification) {
						if(!initNotifystart) return ;
						//console.log(NotificationHistory.find({}).count());
					 /*Electrify.call('setBadgeCount',[NotificationHistory.find({}).count()], function(err, msg) {
						 if(err){
							console.log(err);
						 }else{
							console.log(msg);
						 }
					 });*/
					 /*Electrify.call('showDoneNotification',[notification], function(err, msg) {
						 if(err){
							console.log(err);
						 }else{
							console.log(msg);
						 }
					 });*/

						let options = {
							body: notification.text,
							icon: '/icon.png',
							data: notification
						}
						let n = new Notification(notification.title,options);
						n.onclick = function(e) {
							if(notification.link){
								console.log(notification.link);
								Meteor.call('markRead',notification._id);
								Meteor.call('registerClick', notification._id);
								Router.go(notification.link);
								//window.open(Router.path[notification.link].url(), '_self');
								window.focus();
							}else{
								Router.go('/notifications');
								//window.open(Router.routes['notifications'].url(), '_self');
								window.focus();
							}
						};
						Meteor.setTimeout(n.close.bind(n), 5000);
					},
					changed: function(notification) {
						//console.log(NotificationHistory.find({}).count());
						//Electrify.call('setBadgeCount',NotificationHistory.find({}).count());
					},
					removed: function(notification) {
						//console.log(NotificationHistory.find({}).count());
						//Electrify.call('setBadgeCount',NotificationHistory.find({}).count());
					}
				});

			}
		}
	}
});
