Package.describe({
  name: 'meteoric:camera',
  summary: 'Camera with one function call on desktop and mobile.',
  version: '1.0.2'
});

Cordova.depends({
  'org.apache.cordova.camera':'0.3.2'
});

Package.onUse(function(api) {
  api.export('MeteoricCamera');

  api.use(["tap:i18n@1.0.7"], ["client", "server"]);
  api.use(['templating', 'session', 'ui', 'blaze', 'less@2.5.0_2', 'reactive-var', 'meteoric:ionic@0.1.13']);
  api.versionsFrom('METEOR@1.2');

  api.addFiles("package-tap.i18n", ["client", "server"]);

  api.addFiles('camera.js');

  api.addFiles([
    'camera-browser.js',
    'camera.less',
    'templates/errorMessage.html',
    'templates/permissionDenied.html',
    'templates/viewfinder.html',
    'templates/viewfinder.js'
  ], ['web.browser']);

  api.addFiles([
    "i18n/en.i18n.json",
    "i18n/fr.i18n.json"
  ], ["client", "server"]);


  api.addFiles('camera-cordova.js', ['web.cordova']);
});
