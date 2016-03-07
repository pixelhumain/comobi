Meteor.startup(function () {

	Push.addListener('startup', function(notification) {

		if(notification.payload.pushType === 'news'){
			Router.go('newsDetail', {
				_id: notification.payload.eventId,
				newsId: notification.payload.newsId,
				scope: notification.payload.scope,
			});
		}
		else if(notification.payload.pushType === 'likeNews'){
			Router.go('newsDetail', {
				_id: notification.payload.eventId,
				newsId: notification.payload.newsId,
				scope: notification.payload.scope,
			});
		}
	});

	Push.addListener('message', function(notification) {
		function alertDismissed() {
			if(notification.payload.pushType === 'news'){
				Router.go('newsDetail', {
					_id: notification.payload.eventId,
					newsId: notification.payload.newsId,
					scope: notification.payload.scope,
				});
			} else if(notification.payload.pushType === 'likeNews'){
				Router.go('newsDetail', {
					_id: notification.payload.eventId,
					newsId: notification.payload.newsId,
					scope: notification.payload.scope,
				});
			}
		}
		window.confirm(notification.message, alertDismissed, notification.payload.title, ["Voir","fermer"]);
	});
});
