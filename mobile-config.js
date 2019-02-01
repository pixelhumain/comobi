App.info({
  id: 'org.communecter.mobile',
  name: 'communecter',
  description: 'communecter mobile',
  author: 'thomas',
  email: 'thomas.craipeau@gmail.com',
  version: '0.0.29',
  buildNumber: '129',
});

App.setPreference('android-targetSdkVersion', '26');
App.setPreference('android-minSdkVersion', '21');

App.configurePlugin('phonegap-plugin-push', {
  SENDER_ID: 376774334081,
});

App.configurePlugin('cordova-plugin-customurlscheme', {
  URL_SCHEME: 'communecter',
});

App.configurePlugin('net.yoik.cordova.plugins.intentfilter', {
  URL_SCHEME: 'https',
  HOST_NAME: 'www.communecter.org',
});

App.icons({
  android_mdpi: 'ressource/android/mipmap-mdpi/ic_launcher.png',
  android_hdpi: 'ressource/android/mipmap-hdpi/ic_launcher.png',
  android_xhdpi: 'ressource/android/mipmap-xhdpi/ic_launcher.png',
  android_xxhdpi: 'ressource/android/mipmap-xxhdpi/ic_launcher.png',
  android_xxxhdpi: 'ressource/android/mipmap-xxxhdpi/ic_launcher.png',
  app_store: 'ressource/ios/iTunesArtwork@2x.png',
  ios_spotlight_3x: 'ressource/ios/AppIcon.appiconset/Icon-40@3x.png',
  ios_notification_2x: 'ressource/ios/AppIcon.appiconset/Icon-40@1x.png',
  ios_notification_3x: 'ressource/ios/AppIcon.appiconset/Icon-20@3x.png',
  ipad_app_legacy: 'ressource/ios/AppIcon.appiconset/Icon-72@1x.png',
  ipad_app_legacy_2x: 'ressource/ios/AppIcon.appiconset/Icon-72@2x.png',
  ipad_spotlight_legacy: 'ressource/ios/AppIcon.appiconset/Icon-Small-50@1x.png',
  ipad_spotlight_legacy_2x: 'ressource/ios/AppIcon.appiconset/Icon-Small-50@2x.png',
  ios_notification: 'ressource/ios/AppIcon.appiconset/Icon-20@1x.png',
  iphone_legacy: 'ressource/ios/AppIcon.appiconset/Icon-57@1x.png',
  iphone_legacy_2x: 'ressource/ios/AppIcon.appiconset/Icon-57@2x.png',
  iphone_2x: 'ressource/ios/AppIcon.appiconset/Icon-60@2x.png',
  iphone_3x: 'ressource/ios/AppIcon.appiconset/Icon-60@3x.png',
  ipad: 'ressource/ios/AppIcon.appiconset/Icon-76.png',
  ipad_2x: 'ressource/ios/AppIcon.appiconset/Icon-76@2x.png',
  ipad_pro: 'ressource/ios/AppIcon.appiconset/Icon-83.5@2x.png',
  ios_settings: 'ressource/ios/AppIcon.appiconset/Icon-Small.png',
  ios_settings_2x: 'ressource/ios/AppIcon.appiconset/Icon-Small@2x.png',
  ios_settings_3x: 'ressource/ios/AppIcon.appiconset/Icon-Small@3x.png',
  ios_spotlight: 'ressource/ios/AppIcon.appiconset/Icon-40.png',
  ios_spotlight_2x: 'ressource/ios/AppIcon.appiconset/Icon-40@2x.png',
});

App.launchScreens({
  android_mdpi_portrait: 'ressource/android/mipmap-mdpi/background.9.png',
  android_hdpi_portrait: 'ressource/android/mipmap-hdpi/background.9.png',
  android_xhdpi_portrait: 'ressource/android/mipmap-xhdpi/background.9.png',
  android_xxhdpi_portrait: 'ressource/android/mipmap-xxhdpi/background.9.png',
  android_xxxhdpi_portrait: 'ressource/android/mipmap-xxxhdpi/background.9.png',
  iphone_2x: 'ressource/ios/splash/Default@2x.png',
  iphone5: 'ressource/ios/splash/Default-568h@2x.png',
  iphone6: 'ressource/ios/splash/Default-667h@2x.png',
  iphone6p_portrait: 'ressource/ios/splash/Default-Portrait-736h@3x.png',
  iphone6p_landscape: 'ressource/ios/splash/Default-Landscape-736h@3x.png',
  ipad_portrait: 'ressource/ios/splash/Default-Portrait.png',
  ipad_portrait_2x: 'ressource/ios/splash/Default-Portrait@2x.png',
  ipad_landscape: 'ressource/ios/splash/Default-Landscape.png',
  iphoneX_portrait: 'ressource/ios/splash/Default-Portrait-1125h.png',
  ipad_landscape_2x: 'ressource/ios/splash/Default-Landscape@2x.png',
});

/* App.appendToConfig(`<platform name="android">
  <resource-file src="google-services.json" target="google-services.json" />
</platform>`); */

App.addResourceFile('google-services.json', 'app/google-services.json', 'android');
App.addResourceFile('GoogleService-Info.plist', 'GoogleService-Info.plist', 'ios');

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#324553');
App.setPreference('Orientation', 'portrait');

App.appendToConfig(`<platform name="ios">
    <config-file platform="ios" target="*-Info.plist" parent="NSPhotoLibraryUsageDescription">
      <string>Communecter requires your camera for taking pictures</string>
    </config-file>
    <config-file platform="ios" target="*-Info.plist" parent="NSCameraUsageDescription">
      <string>Communecter requires your camera for taking pictures</string>
    </config-file>
    <config-file platform="ios" target="*-Info.plist" parent="NSLocationUsageDescription">
      <string>Your current location is used to show services that are nearby</string>      
    </config-file>
    <config-file platform="ios" target="*-Info.plist" parent="NSLocationWhenInUseUsageDescription">
      <string>Your current location is used to show services that are nearby</string>
    </config-file>
    <config-file platform="ios" target="*-Info.plist" parent="NSContactsUsageDescription">
      <string>Your current contacts is used to invite your friends who have an email</string>
    </config-file>
  </platform>`);

App.accessRule('*');
App.accessRule('http://*');
App.accessRule('https://*');
App.accessRule('http://*', { type: 'navigation' });
App.accessRule('https://*', { type: 'navigation' });
App.accessRule('http://qa.communecter.org/*', { type: 'navigation' });
App.accessRule('https://qa.communecter.org/*', { type: 'navigation' });
App.accessRule('http://www.communecter.org/*', { type: 'navigation' });
App.accessRule('https://www.communecter.org/*', { type: 'navigation' });
App.accessRule('https://co-mobile.communecter.org/*');
// App.accessRule('http://localhost*');
App.accessRule('*.openstreetmap.org/*', { type: 'navigation' });
App.accessRule('*.tile.thunderforest.com/*', { type: 'navigation' });
App.accessRule('http://a.tiles.mapbox.com/*', { type: 'navigation' });
App.accessRule('https://api.tiles.mapbox.com/*', { type: 'navigation' });
App.accessRule('https://placeholdit.imgix.net/*', { type: 'navigation' });
