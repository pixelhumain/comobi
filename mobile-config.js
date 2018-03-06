App.info({
  id: 'org.communecter.mobile',
  name: 'communecter',
  description: 'communecter mobile',
  author: 'thomas',
  email: 'thomas.craipeau@gmail.com',
  version: '0.0.18',
  buildNumber: '118'
});

App.setPreference('android-targetSdkVersion', '23');
App.setPreference('android-minSdkVersion', '19');

App.configurePlugin('phonegap-plugin-push', {
  SENDER_ID: 376774334081
});

App.configurePlugin('cordova-plugin-customurlscheme', {
  URL_SCHEME: 'communecter'
});

App.configurePlugin('net.yoik.cordova.plugins.intentfilter', {
 URL_SCHEME: 'https',
 HOST_NAME: 'www.communecter.org'
});

App.icons({
	'android_mdpi': 'ressource/android/mipmap-mdpi/ic_launcher.png',
	'android_hdpi': 'ressource/android/mipmap-hdpi/ic_launcher.png',
	'android_xhdpi': 'ressource/android/mipmap-xhdpi/ic_launcher.png',
	'android_xxhdpi':'ressource/android/mipmap-xxhdpi/ic_launcher.png',
	'android_xxxhdpi':'ressource/android/mipmap-xxxhdpi/ic_launcher.png',
	'iphone_2x':'ressource/ios/AppIcon.appiconset/Icon-60@2x.png',
	'iphone_3x':'ressource/ios/AppIcon.appiconset/Icon-60@3x.png',
	'ipad':'ressource/ios/AppIcon.appiconset/Icon-76.png',
	'ipad_2x':'ressource/ios/AppIcon.appiconset/Icon-76@2x.png'
	//'ipad_pro':'ressource/ios/AppIcon.appiconset/Icon-83.5@2x.png',
	//'ios_settings':'ressource/ios/AppIcon.appiconset/Icon-Small.png',
	//'ios_settings_2x':'ressource/ios/AppIcon.appiconset/Icon-Small@2x.png',
	//'ios_settings_3x':'ressource/ios/AppIcon.appiconset/Icon-Small@3x.png',
	//'ios_spotlight':'ressource/ios/AppIcon.appiconset/Icon-40.png',
	//'ios_spotlight_2x':'ressource/ios/AppIcon.appiconset/Icon-40@2x.png'
});

App.launchScreens({
	'android_mdpi_portrait': 'ressource/android/mipmap-mdpi/background.9.png',
	'android_hdpi_portrait': 'ressource/android/mipmap-hdpi/background.9.png',
	'android_xhdpi_portrait': 'ressource/android/mipmap-xhdpi/background.9.png',
	'android_xxhdpi_portrait':'ressource/android/mipmap-xxhdpi/background.9.png',
	'iphone_2x':'ressource/ios/splash/Default@2x.png',
	'iphone5':'ressource/ios/splash/Default-568h@2x.png',
	'iphone6':'ressource/ios/splash/Default-667h@2x.png',
	'iphone6p_portrait':'ressource/ios/splash/Default-Portrait-736h@3x.png',
	'iphone6p_landscape':'ressource/ios/splash/Default-Landscape-736h@3x.png',
	'ipad_portrait':'ressource/ios/splash/Default-Portrait.png',
	'ipad_portrait_2x':'ressource/ios/splash/Default-Portrait@2x.png',
	'ipad_landscape':'ressource/ios/splash/Default-Landscape.png',
	'ipad_landscape_2x':'ressource/ios/splash/Default-Landscape@2x.png'
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#324553');
App.setPreference('Orientation', 'portrait');


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
App.accessRule('http://localhost*');
App.accessRule('*.openstreetmap.org/*', { type: 'navigation' });
App.accessRule('*.tile.thunderforest.com/*', { type: 'navigation' });
App.accessRule('https://api.tiles.mapbox.com/*', { type: 'navigation' });
App.accessRule('https://placeholdit.imgix.net/*', { type: 'navigation' });
