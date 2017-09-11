# Meteor Video Chat
This extension allows you to implement user-to-user video calling in React, Angular and Blaze.


[Example](https://meteorvideochat.herokuapp.com) - Try creating 2 user accounts (one incognito) and calling one another. 

[Click here for the example source code.](https://github.com/elmarti/meteor-video-chat-example)

[![Stories in Ready](https://badge.waffle.io/elmarti/meteor-video-chat.svg?label=ready&title=Ready)](http://waffle.io/elmarti/meteor-video-chat)
[![Travis CI](https://travis-ci.org/elmarti/meteor-video-chat.svg?branch=master)](https://travis-ci.org/elmarti/meteor-video-chat)
## Configuration
Here you can set the [RTCConfiguration](https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration). If you are testing outside of a LAN, you'll need to procure some [STUN & TURN](https://gist.github.com/yetithefoot/7592580) servers.

```
Meteor.VideoCallServices.RTCConfiguration = [{'iceServers': [{
    'urls': 'stun:stun.example.org'
  }]
}];
```
#### Calling a user
To call a user, call the following method with their _id, the local video element/ react ref and the target video/react ref.
```
Meteor.VideoCallServices.call(targetUserId, this.refs.caller, this.refs.target);
```
#### Deciding who can connect to whom
The follow method can be overridden on the server side to implement some kind of filtering. Returning `false` will cancel the call, and `true` will allow it to go ahead.
```
Meteor.VideoCallServices.checkConnect = function(caller, target){
return *can caller and target call each other"
};
```
#### Answering a call
The first step is to handle the onReceivePhoneCall callback and then to accept the call. The answerPhoneCall method accepts the local video and the target video.
```
 Meteor.VideoCallServices.onReceivePhoneCall = (userId) => {
Meteor.VideoCallServices.answerPhoneCall(this.refs.caller, this.refs.target);
        };

```
#### Ending phone call
Simply call
```
Meteor.VideoCallServices.endPhoneCall();
```
#### Other events
The following method is invoked when the callee accepts the phone call.
```
Meteor.VideoCallServices.onTargetAccept = () => {
}
```
The following method is invoked when either user ends the call
```
Meteor.VideoCallServices.onTerminateCall = () => {
}
```
The following method invoked when the RTCPeerConnection instance has been created, making it possible to consitently mutate it or add a data channel
```
Meteor.VideoCallServices.onPeerConnectionCreated = () => {
}

``` 
The retry count can but used to limit the amount of reconnection attempts when ICE fails 
```
Meteor.VideoCallServices.RetryLimit = 5;  //defaulted to 5

```


The following method is invoked on both the client and server whenever an error is caught.
User is only passed on the server

```
Meteor.VideoCallServices.onError = (err, data, user) => {
}
```
The onError section can also be used for handling errors thrown when obtaining the user media (Webcam/audio).
[See here for more info](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Exceptions), or checkout the example.


This project is sponsored by the following:

[![BrowserStack](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)](https://www.browserstack.com/)

[![Sentry.io](https://sentry.io/_assets/branding/png/sentry-horizontal-black-6aaf82e66456a21249eb5bef3d3e65754cadfd498f31469002bc603d966d08ef.png)](https://sentry.io/)