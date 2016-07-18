Package.describe({
  name: 'aboire:camera-ui',
  version: '0.0.2',
  summary: 'Take photos with UI one function call on desktop and mobile. Choose between camera to photoLibrary.',
  documentation: 'README.md'
});

Cordova.depends({
  "cordova-plugin-actionsheet": "2.2.2",
  "cordova-plugin-device": "1.1.1"
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles("package-tap.i18n", ["client", "server"]);
  api.export('MeteorCameraUI');
  api.use(["tap:i18n@1.0.7"], ["client", "server"]);
  api.use(['templating']);
  api.use('meteoric:camera@1.0.3');
  api.addFiles('camera-ui.js');
  api.addFiles('camera-ui-client.js', ['web.browser', 'web.cordova']);
  api.addFiles('camera-ui-browser.js', ['web.browser']);
  api.addFiles('camera-ui-cordova.js', ['web.cordova']);

  api.addFiles([
    "i18n/en.i18n.json",
    "i18n/fr.i18n.json"
  ], ["client", "server"]);

});
