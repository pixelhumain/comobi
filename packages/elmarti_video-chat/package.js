Package.describe({
  name: 'elmarti:video-chat',
  version: '1.1.4',
  // Brief, one-line summary of the package.
  summary: 'Simple WebRTC Video Chat for your app.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/elmarti/meteor-video-chat',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(api => {
  api.versionsFrom('1.5');
  api.use('ecmascript');
  api.use("rocketchat:streamer@0.5.0");
  api.use("mizzao:user-status@0.6.6");
  api.addFiles(['services/server.js', 'services/publish.js'], "server");
  api.addFiles(['services/client.js', 'services/adapter.js'], "client");
});
Package.onTest(api => {
  api.use('ecmascript');
  api.use('tinytest');
  
  api.addFiles('video-chat-tests.js');
  api.export([]);
});
