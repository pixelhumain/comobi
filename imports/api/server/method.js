import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { Push } from 'meteor/raix:push';
import { moment } from 'meteor/momentjs:moment';
import { URL } from 'meteor/url';
//collection et schemas
import { NotificationHistory } from '../notification_history.js';
import { Citoyens,SchemasFollowRest,SchemasInviteAttendeesEventRest } from '../citoyens.js';
import { News,SchemasNewsRest } from '../news.js';
import { Documents } from '../documents.js';
import { Photosimg } from './photosimg.js';
import { Cities } from '../cities.js';
import { Events,SchemasEventsRest } from '../events.js'

//function api
import { apiCommunecter } from './api.js';

//helpers
import { encodeString } from '../helpers.js';
import { ValidEmail,IsValidEmail } from 'meteor/froatsnook:valid-email';

URL._encodeParams = (params, prefix) => {
  var str = [];
  for(var p in params) {
    if (params.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = params[p];
      if(typeof v === "object") {
        str.push(this._encodeParams(v, k));
      } else {
        var encodedKey = encodeString(k).replace('%5B', '[').replace('%5D', ']');
        str.push(encodedKey + "=" + encodeString(v));
      }
    }
  }
  return str.join("&").replace(/%20/g, '+');
};

//events
//profil
//http://qa.communecter.org/upload/communecter/events/578a14c1dd0452a71cd386b6/1468874520_moon.png
//http://qa.communecter.org/upload/communecter/events/578a14c1dd0452a71cd386b6/thumb/profil-resized.png
//http://qa.communecter.org/upload/communecter/events/578a14c1dd0452a71cd386b6/thumb/profil-marker.png
//album
//http://qa.communecter.org/upload/communecter/events/578a14c1dd0452a71cd386b6/album/1468873065_moon.png

//refactor pour Utiliser l'upload des photos de news depuis le rest comme profil event

Meteor.methods({
  userup (geo) {
    check(geo, {longitude:Number,latitude:Number});
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (Citoyens.update({
      _id: new Mongo.ObjectID(this.userId)
    }, {
      $set: {
        'geoPosition': {
          type: "Point",
          'coordinates': [parseFloat(geo.longitude), parseFloat(geo.latitude)]
        }
      }
    })) {
      return true;
    } else {
      return false;
    }
    this.unblock();
  },
  likePhoto (photoId) {
    check(photoId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    let doc={};
    doc.id=photoId;
    doc.collection="news";
    doc.action="voteUp";
    let voteQuery={};
    voteQuery["_id"] = new Mongo.ObjectID(photoId);
    voteQuery['voteUp.'+this.userId]={$exists:true};

    if (News.findOne(voteQuery)) {
      doc.unset="true";
      Meteor.call('addAction',doc);

    } else {
      let voteQuery={};
      voteQuery["_id"] = new Mongo.ObjectID(photoId);
      voteQuery['voteDown.'+this.userId]={$exists:true};

      if (News.findOne(voteQuery)) {
        let rem={};
        rem.id=photoId;
        rem.collection="news";
        rem.action="voteDown";
        rem.unset="true";
        Meteor.call('addAction',rem);

      }
      Meteor.call('addAction',doc);

    }
  },
  dislikePhoto (photoId) {
    check(photoId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    let doc={};
    doc.id=photoId;
    doc.collection="news";
    doc.action="voteDown";
    let voteQuery={};
    voteQuery["_id"] = new Mongo.ObjectID(photoId);
    voteQuery['voteDown.'+this.userId]={$exists:true};

    if (News.findOne(voteQuery)) {
      doc.unset="true";
      Meteor.call('addAction',doc);
    } else {

      let voteQuery={};
      voteQuery["_id"] = new Mongo.ObjectID(photoId);
      voteQuery['voteUp.'+this.userId]={$exists:true};

      if (News.findOne(voteQuery)) {
        let rem={};
        rem.id=photoId;
        rem.collection="news";
        rem.action="voteUp";
        rem.unset="true";
        Meteor.call('addAction',rem);
      }
      Meteor.call('addAction',doc);

    }
  },
  addAction (doc){
    check(doc.id, String);
    check(doc.collection, String);
    check(doc.action, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var retour = apiCommunecter.postPixel("action","addaction",doc);
    return retour;
  },
  followPersonExist (connectUserId){
    //type : person / follows
    //connectUserId
    check(connectUserId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    let doc={};
    doc.connectUserId=connectUserId;
    var retour = apiCommunecter.postPixel("person","follows",doc);
    return retour;
  },
  followPerson (doc){
    //type : person / follows
    //invitedUserName
    //invitedUserEmail
    check(doc, SchemasFollowRest);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var retour = apiCommunecter.postPixel("person","follows",doc);
    return retour;
  },
  saveattendeesEvent (eventId,email){
    check(eventId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    let doc={};
    doc.parentId=eventId;
    doc.parentType='events';
    doc.childType="citoyens";
    if(typeof email !== 'undefined'){
    doc.childId=Citoyens.findOne({email:email})._id._str;
    }else{
    doc.childId=this.userId;
    }
    var retour = apiCommunecter.postPixel("link","connect",doc);
    return retour;
  },
  inviteattendeesEvent (doc){
    check(doc, SchemasInviteAttendeesEventRest);
    check(doc.invitedUserEmail,ValidEmail);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    if (!Meteor.call('isEmailValid',doc.invitedUserEmail)) {
      throw new Meteor.Error("Email not valid");
    }
    let insertDoc={};
    insertDoc.parentId=doc.eventId;
    insertDoc.parentType='events';
    insertDoc.childType="citoyens";
    insertDoc.childEmail=doc.invitedUserEmail;
    insertDoc.childName=doc.invitedUserName;
    insertDoc.connectType="attendees";
    insertDoc.childId="";
    let retour = apiCommunecter.postPixel("link","connect",insertDoc);
    return retour;
  },
  insertNew (doc){
    //type : organizations / projects > organizerId
    check(doc, SchemasNewsRest);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(!doc.parentType){
      doc.parentType="events";
    }
    if(!doc.scope){
      doc.scope="public";
    }

    var retour = apiCommunecter.postPixel("news","save",doc);

    if(doc.media && doc.media.content && doc.media.content.imageId){
      let image = Photosimg.findOne({_id:doc.media.content.imageId});
      image.on('stored', Meteor.bindEnvironment(function() {
        News.update({_id:new Mongo.ObjectID(retour.data.id["$id"])},{$set:{'media.content.image':'https://communevent.communecter.org'+image.url()}});
      }));
    }

    return retour;
  },
  updateNew (modifier,documentId){
    check(modifier["$set"], SchemasNewsRest);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (!News.findOne({_id:documentId}).isAuthor()) {
      throw new Meteor.Error("not-authorized");
    }

    let updateNew = {};
    updateNew.name = 'newsContent'+documentId._str;
    updateNew.value = modifier["$set"].text;
    updateNew.pk = documentId._str;

    var retour = apiCommunecter.postPixel("news","updatefield",updateNew);
    return retour;
  },
  photoNews (photo,str,type,idType) {
    check(str, String);
    check(type, String);
    check(idType, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var newsId;
    var photoret = Meteor.call('cfsbase64tos3up',photo,str,type,idType);
    let insertNew = {};
    insertNew.parentId=idType;
    insertNew.parentType=type;
    insertNew.text="photo";
    insertNew["media"]={};
    insertNew["media"]["type"]="url_content";
    //insertNew.media.name="";
    //insertNew.media.description="";
    insertNew["media"]["content"]={};
    insertNew["media"]["content"]["type"]="img_link";
    //insertNew.media.content.url="";
    //insertNew["media"]["content"]["image"]=image.url();
    insertNew["media"]["content"]["imageId"]=photoret;
    insertNew["media"]["content"]["imageSize"]="large";
    //insertNew.media.content.videoLink="";
    newsId = Meteor.call('insertNew',insertNew);
    if(photoret && newsId){
      let image = Photosimg.findOne({_id:photoret});
      image.on('stored', Meteor.bindEnvironment(function() {
        News.update({_id:new Mongo.ObjectID(newsId.data.id["$id"])},{$set:{'media.content.image':'https://communevent.communecter.org'+image.url()}});

        if(Documents.find({objId:photoret}).count()==0){
          let insertDoc = {};
          insertDoc.id = idType;
          insertDoc.type = "events";
          insertDoc.folder = "cfs/files/photosimg/"+photoret;
          insertDoc.objId = photoret;
          insertDoc.moduleId = "communevent";
          insertDoc.doctype = "image";
          insertDoc.name = image.name();
          insertDoc.size = image.size();
          insertDoc.contentKey = "slider";
          //console.log(insertDoc);
          let docId = Documents.insert(insertDoc);
          //console.log(docId);
        }
      }));
      return {photoret:photoret,newsId:newsId.data.id["$id"]};
    }else{
      throw new Meteor.Error("photoNews error");
    }
  },
  photoNewsUpdate (newsId,photoId) {
    check(newsId, String);
    check(photoId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    let parentId = News.findOne({_id:new Mongo.ObjectID(newsId)}).target.id;
    let parentType = News.findOne({_id:new Mongo.ObjectID(newsId)}).target.type;
    let media={};
    media["type"]="url_content";
    media["content"]={};
    media["content"]["type"]="img_link";
    media["content"]["imageId"]=photoId;
    media["content"]["imageSize"]="large";
    News.update({_id:new Mongo.ObjectID(newsId)},{$set:{'media':media}});

    let image = Photosimg.findOne({_id:photoId});
    image.on('stored', Meteor.bindEnvironment(function() {
      News.update({_id:new Mongo.ObjectID(newsId)},{$set:{'media.content.image':'https://communevent.communecter.org'+image.url()}});

      if(Documents.find({objId:photoId}).count()==0){
        let insertDoc = {};
        insertDoc.id = parentId;
        insertDoc.type = "events";
        insertDoc.folder = "cfs/files/photosimg/"+photoId;
        insertDoc.objId = photoId;
        insertDoc.moduleId = "communevent";
        insertDoc.doctype = "image";
        insertDoc.name = image.name();
        insertDoc.size = image.size();
        insertDoc.contentKey = "slider";
        let docId = Documents.insert(insertDoc);
      }
    }));

    return image._id;
  },
  cfsbase64tos3up (photo,str,type,idType) {
    check(photo, Match.Any);
    check(str, Match.Any);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var fsFile = new FS.File();
    fsFile.attachData(photo,{'type':'image/jpeg'});
    fsFile.extension('jpg');
    fsFile.name(str);
    fsFile.metadata = {owner: this.userId,type:type,id:idType};
    fsFile.on('error', function (error) {
      //console.log(error);
    });
    fsFile.on("uploaded", function () {
      //console.log(error);
    });

    var photoret=Photosimg.insert(fsFile);

    return photoret._id;
  },
  insertEvent (doc){
    //type : organizations / projects > organizerId
    check(doc, SchemasEventsRest);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(doc.startDate){
      doc.startDate=moment(doc.startDate).format();
    }
    if(doc.endDate){
      doc.endDate=moment(doc.endDate).format();
    }
    if(!doc.organizerId){
      doc.organizerId=this.userId;
    }
    if(!doc.organizerType){
      doc.organizerType="citoyens";
    }
    var retour = apiCommunecter.postPixel("event","save",doc);
    return retour;
  },
  updateEvent (modifier,documentId){
    check(modifier["$set"], SchemasEventsRest);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (!Events.findOne({_id:new Mongo.ObjectID(documentId)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }
    if(modifier["$set"].startDate){
      modifier["$set"].startDate=moment(modifier["$set"].startDate).format();
    }
    if(modifier["$set"].endDate){
      modifier["$set"].endDate=moment(modifier["$set"].endDate).format();
    }
    if(!modifier["$set"].organizerId){
      modifier["$set"].organizerId=this.userId;
    }
    if(!modifier["$set"].organizerType){
      modifier["$set"].organizerType="citoyens";
    }
    modifier["$set"].eventId=documentId;
    var retour = apiCommunecter.postPixel("event","update",modifier["$set"]);
    return retour;
  },
  photoEvents (photo,str,idType) {
    check(str, String);
    check(idType, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (!Events.findOne({_id:new Mongo.ObjectID(idType)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }
    let retourUpload = apiCommunecter.postUploadPixel('events',idType,'avatar',photo,str);
    if(retourUpload){
      let documentId= Meteor.call("insertDocumentProfilEvents",idType,retourUpload);
      if(documentId){
        return documentId;
      }else{
        throw new Meteor.Error("insertDocument error");
      }
    }else{
      throw new Meteor.Error("postUploadPixel error");
    }
  },
  insertDocumentProfilEvents (idType,retourUpload){
    check(idType, String);
    check(retourUpload, Object);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    let insertDoc = {};
    insertDoc.id = idType;
    insertDoc.type = "events";
    insertDoc.folder = "events/"+idType;
    insertDoc.moduleId = "communecter";
    insertDoc.author = this.userId;
    insertDoc.doctype = "image";
    insertDoc.name = retourUpload.name;
    insertDoc.size = retourUpload.size;
    insertDoc.contentKey = "profil";
    let  doc = apiCommunecter.postPixel("document","save",insertDoc);
    //console.log(doc);
    if(doc){
      Events.update({_id:new Mongo.ObjectID(idType)},{$set:{
        'profilImageUrl':'/upload/communecter/events/'+idType+'/'+retourUpload.name,
        'profilThumbImageUrl':'/upload/communecter/events/'+idType+'/thumb/profil-resized.png?='+new Date + Math.floor((Math.random() * 100) + 1),
        'profilMarkerImageUrl':'/upload/communecter/events/'+idType+'/thumb/profil-marker.png?='+new Date + Math.floor((Math.random() * 100) + 1)
      }});
    }
  },
  createUserAccountRest (user){
    //console.log(user);
    check(user, Object);
    check(user.name, String);
    check(user.username, String);
    check(user.email, String);
    check(user.password, String);
    check(user.codepostal, String);
    check(user.city, String);

    var passwordTest = new RegExp("(?=.{8,}).*", "g");
    if (passwordTest.test(user.password) == false) {
      throw new Meteor.Error("Password is Too short");
    }

    if (!IsValidEmail(user.email)) {
      throw new Meteor.Error("Email not valid");
    }

    if (Citoyens.find({email: user.email}).count() !== 0) {
      throw new Meteor.Error("Email not unique");
    }

    if (Citoyens.find({username: user.username}).count() !== 0) {
      throw new Meteor.Error("Username not unique");
    }

    let insee = Cities.findOne({insee: user.city});

    try {
      var response = HTTP.call( 'POST', Meteor.settings.endpoint+'/communecter/person/register', {
        params: {
          "name": user.name,
          "email": user.email,
          "username" : user.username,
          "pwd": user.password,
          "cp": insee.cp,
          "city": insee.insee,
          "geoPosLatitude": insee.geo.latitude,
          "geoPosLongitude": insee.geo.longitude
        }
      });
      //console.log(response);
      if(response.data.result && response.data.id){
        let userId = response.data.id;
        return userId;
      }else{
        throw new Meteor.Error(response.data.msg);
      }
    } catch(e) {
      throw new Meteor.Error("Error server");
    }


  },
  deletePhoto (photoId) {
    check(photoId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var photo = Documents.findOne({
      id: photoId
    }, {
      "fields": {
        objId: 1
      }
    });
    if (photo && photo.objId) {
      /*var s3 = new AWS.S3();
      var params = {
      Bucket: Meteor.settings.aws.bucket,
      Key: photo.urlimage
    };
    s3.deleteObject(params, function(err, data) {
    if (err) //console.log(err, err.stack); // error
    else //console.log(); // deleted
  })*/
  News.remove({
    _id: new Mongo.ObjectID(photoId),
    author: this.userId
  });
  Documents.remove({
    id: photoId,
    author: this.userId
  });
  Photosimg.remove({_id:photo.objId})
}else{
  News.remove({
    _id: new Mongo.ObjectID(photoId),
    author: this.userId
  });
}
},
getcitiesbylatlng (latlng) {
  check(latlng, {latitude:Number,longitude:Number});
  Cities._ensureIndex({
    "geoShape": "2dsphere"
  });
  return Cities.findOne({"geoShape":
  {$geoIntersects:
    {$geometry:{ "type" : "Point",
    "coordinates" : [ latlng.longitude, latlng.latitude ] }
  }
}
},{_disableOplog: true});
},
getcitiesbypostalcode (cp) {
  check(cp, String);
  return Cities.find({'postalCodes.postalCode': cp}).fetch();
},
searchCities (query, options){
  check(query, String);
  if (!query) return [];

  options = options || {};

  // guard against client-side DOS: hard limit to 50
  if (options.limit) {
    options.limit = Math.min(50, Math.abs(options.limit));
  } else {
    options.limit = 50;
  }

  // TODO fix regexp to support multiple tokens
  var regex = new RegExp("^" + query);
  return Cities.find({$or : [{name: {$regex:  regex, $options: "i"}},{'postalCodes.postalCode': {$regex:  regex}}]}, options).fetch();
},
pushNewAttendees (eventId){
  check(eventId, String);
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  let user = Citoyens.findOne({_id: new Mongo.ObjectID(this.userId)});
  let event = Events.findOne({_id: new Mongo.ObjectID(eventId)});
  if(news && event && event.links && event.links.attendees){
    let attendeesIdsTmp = _.map(event.links.attendees, function(attendees,key){
      return key;
    });
    let attendeesIds = _.filter(attendeesIdsTmp, function(attendees){
      return attendees!=this.userId;
    },this);
    //console.log(attendeesIds);
    let title = event.name;
    var text = user.name;
    let payload = {};
    payload['title'] = title;
    payload['pushType'] = 'news';
    payload['newsId'] = newsId;
    payload['eventId'] = eventId;
    payload['scope'] = 'events';

    let query = {};
    query['userId'] = {$in:attendeesIds};
    Meteor.call('pushUser',title,text,payload,query);

  }else{
    throw new Meteor.Error("not-event-news");
  }
},
pushNewNewsAttendees (eventId,newsId){
  check(newsId, String);
  check(eventId, String);
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  let news = News.findOne({_id: new Mongo.ObjectID(newsId)});
  let event = Events.findOne({_id: new Mongo.ObjectID(eventId)});
  if(news && event && event.links && event.links.attendees){
    let attendeesIdsTmp = _.map(event.links.attendees, function(attendees,key){
      return key;
    });
    let attendeesIds = _.filter(attendeesIdsTmp, function(attendees){
      return attendees!=this.userId;
    },this);
    //console.log(attendeesIds);
    let title = event.name;
    if(news.name){
      var text = news.name;
    }else{
      var text = 'nouvelle news';
    }
    let link = '/events/news/'+eventId+'/new/'+newsId;


    let payload = {};
    payload['title'] = title;
    payload['text'] = text;
    payload['pushType'] = 'news';
    payload['newsId'] = newsId;
    payload['eventId'] = eventId;
    payload['scope'] = 'events';
    payload['link'] = link;
    payload['expiration'] = event.endDate;
    payload['addedAt'] =  new Date();
    payload['userId'] = attendeesIds;
    payload['author'] = this.userId;

    let notifId=Meteor.call('insertNotification',payload);
    //let badge=Meteor.call('alertCount',);
    payload['notifId'] = notifId;
    let query = {};

    //envoie d'un coup sans badge
    //query['userId'] = {$in:attendeesIds.map};
    //Meteor.call('pushUser',title,text,payload,query,badge);

    //envoyer user par user si je veux badger
    _.each(attendeesIds,function(value){
      query['userId'] = value;
      let badge=Meteor.call('alertCount',value);
      //console.log(badge);
      Meteor.call('pushUser',title,text,payload,query,badge);
    },title,text,payload,query);


  }else{
    throw new Meteor.Error("not-event-news");
  }
},
pushUser (title,text,payload,query,badge){
  check(title, String);
  check(text, String);
  check(payload, Object);
  check(query, Object);
  Push.send({
    from: 'push',
    title: title,
    text: text,
    payload: payload,
    sound: 'default',
    query: query,
    badge: badge
  });
},
insertNotification (notifObj){
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  return  NotificationHistory.insert(notifObj)

},
markRead (notifId) {
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  // //console.log('mark as read click') // for testing
  return NotificationHistory.update({
    '_id': notifId
  }, {
    $addToSet: {
      'dismissals': this.userId
    }
  })
},
alertCount (attendeesId){
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  return NotificationHistory.find({
    'expiration': {
      $gt: new Date()
    },
    'dismissals': {
      $nin: [attendeesId]
    },
    'userId': {
      $in: [attendeesId]
    }
  }).count();
},
registerClick (notifId) {
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  // //console.log('notification click') // for testing
  return NotificationHistory.update({
    '_id': notifId
  }, {
    $addToSet: {
      'clicks': this.userId
    }
  })
},
allRead () {
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  // //console.log('notification click') // for testing
  return NotificationHistory.update({
    'dismissals': {
      $nin: [this.userId]
    },
    'userId': {
      $in: [this.userId]
    }
  }, {
    $addToSet: {
      'dismissals': this.userId
    }
  },{ multi: true})
},
isEmailValid: function(address) {
  check(address, String);

  // modify this with your key
  var result = HTTP.get('https://api.mailgun.net/v2/address/validate', {
    auth: 'api:pubkey-f83ce05bc8c736077a883e9c1d54ed29',
    params: {address: address.trim()}
  });

  if (result.statusCode === 200) {
    // is_valid is the boolean we are looking for
    return result.data.is_valid;
  } else {
    // the api request failed (maybe the service is down)
    // consider giving the user the benefit of the doubt and return true
    return true;
  }
}
});
