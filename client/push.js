Meteor.startup(function () {

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
