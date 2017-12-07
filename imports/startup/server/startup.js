import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { Mongo } from 'meteor/mongo';

import { Gamesmobile, Playersmobile, Questsmobile } from '../../api/gamemobile.js';
import { Highlight } from '../../api/highlight.js';

Meteor.startup(function() {
  if (Highlight.find().count() === 0) {
    // seed
    const highlightSeed = [{
      startDate: moment('2017-10-25T18:00:00+04:00').toDate(),
      endDate: moment('2017-11-26T14:00:00+04:00').toDate(),
      parentId: '59bf946240bb4e6006cf5d4d',
      parentType: 'events',
      localityId: '54c0965cf6b95c141800a516',
    },
    {
      startDate: moment('2017-10-25T18:00:00+04:00').toDate(),
      endDate: moment('2017-11-26T14:00:00+04:00').toDate(),
      parentId: 'c33d55fe31905a689c7cfe68',
      parentType: 'gamesmobile',
      localityId: '54c0965cf6b95c141800a516',
    }];
    highlightSeed.forEach(function (highlight) {
      Highlight.insert(highlight);
    });
  }

  if (Gamesmobile.find().count() === 0) {
    const doc = {};
    // seed super jeu
    doc._id = new Mongo.ObjectID('c33d55fe31905a689c7cfe68');
    doc.name = 'Jeu Alternatiba Péi : PARCOURS DES ALTERNATIVES';
    doc.description = `Découvrez le village Alternatiba 2017 en jouant à une petite chasse aux trésors.
Il vous suffit de répondre aux questions ci-dessous en allant chercher dans le village les QRCodes correspondant. Scannez-les pour valider votre réponse et passez à la question suivante.
Attention le temps est compté. Il y aura une surprise pour les 3 premières place !
À vos marques. Prêt ? Scannez !`;
    doc.startDate = moment('2017-10-25T18:00:00+04:00').toDate();
    doc.endDate = moment('2017-11-26T14:00:00+04:00').toDate();
    doc.parentId = '59bf946240bb4e6006cf5d4d';
    doc.parentType = 'events';
    const idGame = Gamesmobile.insert(doc);

    const quests = [{
      idGame: idGame._str,
      pointWin: 5,
      order: 1,
      question: 'Mettez vous à l\'aise en scannant le QR code du village 2017 (stand Communecter, kartié citoyenneté).',
      questType: 'events',
      questId: '59bf946240bb4e6006cf5d4d',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 2,
      question: 'Quelle association propose des couches lavables pour bébé ?',
      questType: 'organizations',
      questId: '59beb5a940bb4e5469cf5d60',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 3,
      question: 'Qui iriez vous voir pour cuire vos aliments grâce au soleil ?',
      questType: 'organizations',
      questId: '565566dadd0452056f94319b',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 4,
      question: 'Trouvez l\'alternative à la consommation d\'eau dans les toilettes.',
      questType: 'organizations',
      questId: '555ddd5cc655675cdd65bf12',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 5,
      question: 'Quelle association est engagée à la sensibilisation des sciences et de la nature ?',
      questType: 'organizations',
      questId: '555eba46c655675cdd65bf17',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 6,
      question: 'Trouvez la coopérative qui vous apporte tout type d\'alimentation en vrac.',
      questType: 'organizations',
      questId: '5948f7c840bb4ed10687aa76',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 7,
      question: 'Quel service public protège la biodiversité et les espaces naturels marins protégés ?',
      questType: 'organizations',
      questId: '584011d640bb4e323c897d28',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 8,
      question: 'Quelle alternative locale organise le développement d\'une monnaie locale réunionnaise ?',
      questType: 'projects',
      questId: '57e7ab6440bb4e4256d41c27',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 9,
      question: 'Trouvez la zone où l\'on pratique de la permaculture.',
      questType: 'poi',
      questId: '5a1673f940bb4e0c4f3dff71',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 10,
      question: 'Quelle organisation locale sensibilise à la réduction des déchets ?',
      questType: 'organizations',
      questId: '5718adac40bb4eeb271d6501',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 11,
      question: 'Quelle organisation propose une alternative aux pesticides en élevant des coccinelles ?',
      questType: 'organizations',
      questId: '584011d240bb4e323c897c1c',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 12,
      question: 'Trouvez la seule et unique construction en bambou du village.',
      questType: 'poi',
      questId: '5a16718740bb4ea94e3dff6c',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 13,
      question: 'Trouvez l\'association d\'artisans utilisant des palettes pour faire de magnifiques meubles.',
      questType: 'organizations',
      questId: '571de5e440bb4e063d967449',
    }, {
      idGame: idGame._str,
      pointWin: 5,
      order: 14,
      question: 'Où mettons-nous nos épluchures pour en faire un fertilisant 100% naturel ?',
      questType: 'poi',
      questId: '59bfa26140bb4e1c08cf5d4d',
    }, {
      idGame: idGame._str,
      pointWin: 20,
      order: 15,
      question: 'Bonus (20 points) : trouvez LE légume lontan disposant d\'un QR code.',
      questType: 'poi',
      questId: '5a167ab140bb4ee54f3dff76',
    }];

    let order = 0;
    quests.forEach(function (quest) {
      order += 1;
      quest.order = order;
      Questsmobile.insert(quest);
    });
  }

// var retour =   Meteor.users.find({_id:"562f3e11e41d7546793ba4c6"});
// console.log(JSON.stringify(retour.fetch()));

/* Events.find({}).fetch().map(function(c){
console.log(c.geo);
if(c.geo && c.geo.longitude){
console.log(c.geo.longitude);
Events.update({_id:c._id}, {$set: {'geoPosition': {
                       type: "Point",
                       'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
                   }}});
}
}); */

/* Cities.find({}).fetch().map(function(c){
  //console.log(c.geo);
if(c.geo && c.geo.longitude){
console.log(c.geo.longitude);
Cities.update({_id:c._id}, {$set: {'geoPosition': {
                       type: "Point",
                       'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
                   }}});
}
Cities.update({_id:c._id}, {$set: {'geoShape': {
                       type: "Polygon",
                       'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
                   }}});
}); */

/* Cities._ensureIndex({
  "geoShape": "2dsphere"
});
let retour =Cities.findOne({"geoShape":
{$geoIntersects:
  {$geometry:{ "type" : "Point",
  "coordinates" : [ 55.5579927, -21.220991100000003 ] }
}}});
console.log(retour); */
});
