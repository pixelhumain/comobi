//jshint esversion: 6
Package.describe({
  name: 'elmarti:video-chat',
  version: '1.2.0',
  summary: 'Simple WebRTC Video Chat for your app.',
  git: 'https://github.com/elmarti/meteor-video-chat',
  documentation: 'README.md'
});

Package.onUse(api => {
  api.versionsFrom('1.5');
  api.use('ecmascript');
  api.use("rocketchat:streamer@0.5.0");
  api.use("mizzao:user-status@0.6.6");
  api.addFiles(['lib/index.js']);
  api.addFiles(['lib/publish.js'], "server");
  api.addFiles(['lib/adapter.js'], "client");
});
