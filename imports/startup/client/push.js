import { Meteor } from 'meteor/meteor';
import { Push } from 'meteor/raix:push';
import { Router } from 'meteor/iron:router';

import { NotificationHistory } from '../../api/notification_history.js';


Meteor.startup(function () {

	let initNotifystart = NotificationHistory.find().observe({
    added: function(notification) {
      if(!initNotifystart) return ;
      console.log(NotificationHistory.find({}).count());
      Push.setBadge(NotificationHistory.find({}).count());
    },
    changed: function(notification) {
      console.log(NotificationHistory.find({}).count());
      Push.setBadge(NotificationHistory.find({}).count());
    },
    removed: function(notification) {
      console.log(NotificationHistory.find({}).count());
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
});
