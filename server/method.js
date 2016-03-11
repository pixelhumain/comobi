

Meteor.methods({
  saveattendeesEvent : function(scope,eventId){
    check(scope, String);
    check(eventId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    doc={};
    doc.eventId=eventId;
    doc.attendeeId=this.userId;
    var retour = Meteor.call("postPixel",scope,"saveattendees",doc);
    return retour;
  },
  insertEvent : function(doc){
    //type : organizations / projects > organizerId
    console.log(doc);
    check(doc, Schemas.EventsRest);
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
    var retour = Meteor.call("postPixel","event","save",doc);
    return retour;
  },
  updateEvent : function(modifier,documentId){
    check(documentId, String);
    check(modifier, Schemas.EventsRest);
    if (!this.userId) {
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
    var retour = Meteor.call("postPixel","event","update",modifier["$set"]);
    return retour;
  },
  postPixel : function(controller,action,params){
    check(controller, String);
    check(action, String)
    check(params, Object);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var userC = Meteor.users.findOne({_id:this.userId});
    console.log(userC.services.resume.loginTokens[0].hashedToken);
    if(userC && userC.services && userC.services.resume && userC.services.resume.loginTokens && userC.services.resume.loginTokens[0] && userC.services.resume.loginTokens[0].hashedToken){
      var retour = callPixelRest(userC.services.resume.loginTokens[0].hashedToken,"POST",controller,action,params);
      console.log(retour);
      return retour;
    }else{
      throw new Meteor.Error("Error server");
    }
    //try {
    /*} catch(e) {
    throw new Meteor.Error("Error server");
  }*/
},
createUserAccount: function(user){
  console.log(user);
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

  var emailTest = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
  if (emailTest.test(user.email) == false) {
    throw new Meteor.Error("Email not valid");
  }

  if (Citoyens.find({email: user.email}).count() !== 0) {
    throw new Meteor.Error("Email not unique");
  }

  if (Citoyens.find({username: user.username}).count() !== 0) {
    throw new Meteor.Error("Username not unique");
  }

  var pswdDigest = SHA256(user.email+user.password)

  let insee = Cities.findOne({insee: user.city});

  let userId = Citoyens.insert({
    name: user.name,
    email: user.email,
    pwd: pswdDigest,
    created: new Date(),
    address: {
      addressLocality: insee.alternateName,
      codeInsee: insee.insee,
      postalCode:insee.cp
    },
    geo: {
      latitude: insee.geo.latitude,
      longitude: insee.geo.longitude
    },
    geoPosition: {
      type: "Point",
      coordinates : [parseFloat(insee.geo.longitude),parseFloat(insee.geo.latitude)]
    }});
    return userId;
  },
  createUserAccountRest: function(user){
    console.log(user);
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

    var emailTest = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
    if (emailTest.test(user.email) == false) {
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
      var response = HTTP.call( 'POST', 'http://qa.communecter.org/communecter/person/register', {
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
      console.log(response);
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
  deletePhoto: function(photoId) {
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
    if (err) console.log(err, err.stack); // error
    else console.log(); // deleted
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
getcitiesbylatlng: function(latlng) {
  check(latlng, {latitude:Number,longitude:Number});
  return Cities.find({"geoShape":
  {$geoIntersects:
    {$geometry:{ "type" : "Point",
    "coordinates" : [ latlng.longitude, latlng.latitude ] }
  }
}
}).fetch();
},
getcitiesbypostalcode: function(cp) {
  check(cp, String);
  return Cities.find({cp: cp}).fetch();
},
searchCities : function(query, options){
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
  return Cities.find({name: {$regex:  regex, $options: "i"}}, options).fetch();
},
pushNewAttendees : function(eventId){
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
      console.log(attendeesIds);
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
      let notId =
      Meteor.call('pushUser',title,text,payload,query);

    }else{
      throw new Meteor.Error("not-event-news");
    }
    },
pushNewNewsAttendees : function(eventId,newsId){
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
      console.log(attendeesIds);
      let title = event.name;
      if(news.name){
        var text = news.name;
      }else{
        var text = 'nouvelle news';
      }
      let payload = {};
      payload['title'] = title;
      payload['pushType'] = 'news';
      payload['newsId'] = newsId;
      payload['eventId'] = eventId;
      payload['scope'] = 'events';

      let query = {};
      query['userId'] = {$in:attendeesIds};
      let notId =
      Meteor.call('pushUser',title,text,payload,query);

    }else{
      throw new Meteor.Error("not-event-news");
    }
    },
    pushUser : function(title,text,payload,query,notId){
      check(title, String);
      check(text, String);
      check(payload, Object);
      check(query, Object);
      Push.send({
        from: 'communEvent',
        title: title,
        text: text,
        payload: payload,
        query: query,
        notId: notId
      });
    }
  });
