/*Meteor.startup(function () {

	if (Meteor.isCordova) {
		window.alert = navigator.notification.alert;
    window.confirm = navigator.notification.confirm ;
	}

 Push.addListener('startup', function(notification) {

  if(notification.payload.pushType === 'photo'){
    Router.go('mapWithPhoto', {
      _id: notification.payload.photoId
    });
  }
  else if(notification.payload.pushType === 'likePhoto'){
    Router.go('photoDetail', {
      _id: notification.payload.photoId
    });
  }
  else if(notification.payload.pushType === 'requestFriend'){
    Router.go('amis');
  }
  else if(notification.payload.pushType === 'confirmFriend'){
    Router.go('amis');
  }
  else if(notification.payload.pushType === 'messageFriend'){
    Router.go('chat', {
      _id: notification.payload.friendId
    });
  }
});

Push.addListener('message', function(notification) {
		function alertDismissed() {
 if(notification.payload.pushType === 'photo'){
    Router.go('mapWithPhoto', {
      _id: notification.payload.photoId
    });
  } else if(notification.payload.pushType === 'likePhoto'){
    Router.go('photoDetail', {
      _id: notification.payload.photoId
    });
} else if(notification.payload.pushType === 'requestFriend'){
    Router.go('amis');
  }
  else if(notification.payload.pushType === 'confirmFriend'){
    Router.go('amis');
  }
  else if(notification.payload.pushType === 'messageFriend'){
    Router.go('chat', {
      _id: notification.payload.friendId
    });
  }
		}
		window.confirm(notification.message, alertDismissed, notification.payload.title, ["Voir","fermer"]);
	});
});*/
