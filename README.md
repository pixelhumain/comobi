# co
communecter mobile interface based on meteor
directly pluggued into The ODB and also visible on Communecter

- create new Event
- create new User Account
- add a Post on an Event (distributed Event journalisme) : Text, Photo
- Like a Post
- got to event on map
- find Events near you (based on on geolocation change viewing distance)
- map view of all events
- invite from your phone contact list
- connect to people participating in an Event
- events can have a QR code scan
- geo localisation
- notifications of new pushes on an event
- change location being watched
- and support for organizations and projects to come

# Install

* install meteor
* clone the project
* cd communEvent
* meteor npm install
* get certificates, settings files and credentials by asking the devs
* unzip private in projet root (file with certificates)
* put `setting-prod.json` or `settings.json` at the projet root (files with settings and credentials)
* launch app with (ask devs for real cmd)
`$ MONGO_URL='mongodb://USER:PWD@HOST1:PORT,HOST2:PORT/qa-communecter?replicaSet=set-xxxxxxxxxxxxxxxxxxxxxxxxxxx' MONGO_OPLOG_URL='mongodb://USER:PWD@HOST1:PORT,HOST2:PORT/local?authSource=qa-communecter&replicaSet=set-xxxxxxxxxxxxxxxx' meteor run --settings settings.json`

# infos pour les devs

* utiliser les options chrome ou firefox pour du dev mobile (vue adaptive)
* penser c'est que sous meteor les `_id` sont des String et que sous YII mongo c'est un objet
  donc quand on tape dans des collections existantes sur YII il faut utilisé new Mongo.ObjectID()
  avec le string id de meteor dedans `_id._str`
* utilisation du publish de meteor pour l'affichage (pour garder la réactivité de meteor) et pour
  les méthodes des appels REST
* pour le logue aussi c'est particulier car communecter utilise la collection citoyen et que
  sous meteor on est obligé d'utiliser users donc j'ai fait un truc pour pouvoir l'utiliser qui sert au loggue
  tu la dans `import/startup/client/config.js` pour la partie cliente

  et sur le serveur dans `imports/api/server/config.js`

  qui s'appelle `Accounts.registerLoginHandler`

  qui fait un appelle REST

  puis qui insert dans Meteor.users l'id de la collection citoyen correspondante

  puis qui genere le token

  pour l'envoyer en retour avec le userId

  et ce token nous sert pour faire les appelle REST sur communecter vu qu'on partage la même base pour identifier l'user car pour le moment il y a de systeme type oauth sur communecter

## Build et mise en prod

* voir https://guide.meteor.com/mobile.html#building-for-production
* On utilise galaxy

### iOS

* il y a des trucs à voir avec xcode 8 des trucs à rajouter pour que ça passe

### Android

* Génération de 2 apk (pour x86 et ARM car utilisation de crosswalk)
* Signature des apk
* Dépot sur le play Store
