Package.describe({
    name: 'djabatav:geolocation-plus',
    version: '1.1.9'
});

Cordova.depends({
    "cordova-plugin-geolocation": "2.1.0",
    "org.flybuy.nativeutils": "https://github.com/pmwisdom/NativeUtils/tarball/64460ce4e28a346245beb2c5a7413bd67a6c148d"
});

Package.onUse(function(api) {
    api.versionsFrom('1.0.3.1');

    api.use(['session', 'reactive-var']);

    api.addFiles('lib/location.js');

    api.export('Location');
});

Package.onTest(function(api) {
});
