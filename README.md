# co-mobile
communecter mobile application

## dev - commande pour lancer localement

* installer meteor 
* cloner le projet
* puis à la racine du projet

```shell
meteor npm install
```

### env

MONGO_URL - 
MONGO_OPLOG_URL - 

```shell
MONGO_URL='xxx' MONGO_OPLOG_URL='xxx UNIVERSE_I18N_LOCALES=all meteor run --settings settings.json --port 3000
```

## setting file

```js
{
  "galaxy.meteor.com": {
     "env": {
  "ROOT_URL": "",
  "MONGO_URL":"",
  "MONGO_OPLOG_URL":"",
  "METEOR_CORDOVA_COMPAT_VERSION_ANDROID": "",
  "METEOR_CORDOVA_COMPAT_VERSION_IOS": "",
  "UNIVERSE_I18N_LOCALES": "all"
     }
   },
"coenv": "prod",
"environment": "production",
"pushapiKey":"",
"module":"co2",
"endpoint":"",
"mailgunpubkey":"",
"public":{
"module":"co2",
"mapbox": "",
"googlekey": "",
"endpoint":"",
"urlimage":"",
"remoteUrl": "",
"assetPath": ""
}
}
```