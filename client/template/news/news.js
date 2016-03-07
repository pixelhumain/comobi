

Template.newsList.onCreated(function(){
  Session.setDefault('limit', 5);
});

Template.newsList.helpers({
  scope () {
    //Router.current().params.scope
    //verifier le scope
    let scope = Session.get('scope');
    let collection = nameToCollection(scope);
    return collection.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  },
  scopeCardTemplate () {
    return  'listCard'+Session.get('scope');
  },
  isLimit (countNews) {
    return  countNews > Session.get('limit');
  }
});


Template.newsList.events({
  "click .saveattendees-link" (evt) {
    evt.preventDefault();
    var self = this;
    var scopeId=Session.get('scopeId');
		Meteor.call('saveattendeesEvent',"event",scopeId);
	return ;
  },
  "click .give-me-more" (evt) {
    let newLimit = Session.get('limit') + 10;
    Session.set('limit', newLimit);
  },
  "click .photo-link" (event, template) {
    var self = this;
    var scopeId=Session.get('scopeId');
    var scope=Session.get('scope');
    var options = {
      width: 500,
      height: 500,
      quality: 75
    };
    MeteoricCamera.getPicture(options,function (error, data) {
      if (! error) {

        var str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
        //console.log(self._id._str);
        Meteor.call("cfsbase64tos3up",data,str,scope,self._id._str, function (error, photoret) {
          if(photoret){

            /*console.log({
            date: new Date(),
            created: new Date(),
            id: Meteor.userId(),
            author: Meteor.userId(),
            type:"events",
            scope:{events:[self._id._str]}
          });*/
          let insertNew = {};
          insertNew.type = scope;
          insertNew.scope = {};
          //query['date'] = new Date();
          //query['created'] = new Date();
          //query['id'] = Meteor.userId();
          //query['author'] = Meteor.userId();
          insertNew.scope[scope] = [self._id._str];
          var newsId = News.insert(insertNew);

          console.log(newsId)

          /*console.log({
          id:newsId._str, //mettre idnews newsId._str plustot que event self._id._str
          type:"events",
          collection:"cfs.photosimg.filerecord",
          objId:photoret,
          moduleId : "meteor.communecter",
          doctype : "image",
          author : Meteor.userId(),
          "name" : str,
          "contentKey" : "event.news"});*/
          let insertDoc = {};
          insertDoc.id = newsId._str;
          insertDoc.type = scope;
          insertDoc.collection = "cfs.photosimg.filerecord";
          insertDoc.objId = photoret;
          //insertDoc['author'] = Meteor.userId();
          insertDoc.moduleId = "meteor.communecter";
          insertDoc.doctype = "image";
          insertDoc.name = str;
          insertDoc.contentKey = scope+".news";

          Documents.insert(insertDoc, function(error, result) {
              if (!error) {
                //Meteor.call('push',selfresult.str);
                console.log('result',result);
                Meteor.call('pushNewNewsAttendees',self._id._str,newsId._str);
                Router.go('newsList', {_id:self._id._str,scope:scope});
              }else{
                console.log('error',error);
              }
            });

          }
        });
      }});

    }
  });

Template.newsEdit.helpers({
  new () {
    return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
  }
});

Template.newsFields.helpers({
_name () {
  return  TAPi18n.__('news-name');
},
_text () {
  return  TAPi18n.__('news-text');
}
});

AutoForm.addHooks(['addNew', 'editNew'], {
  after: {
    insert(error, result) {
      if (error) {
        console.log("Insert Error:", error);
      } else {
        console.log("Insert Result:", result);

        var self = this;
        var selfresult=result;
        var scopeId=Session.get('scopeId');
        var scope=Session.get('scope');
        var options = {
          width: 500,
          height: 500,
          quality: 75
        };
        //MeteorCamera
        //if (Meteor.isCordova) {
          MeteoricCamera.getPicture(options,function (error, data) {
            // we have a picture
            if (! error) {

              var str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";

              Meteor.call("cfsbase64tos3up",data,str,scope,scopeId, function (error, photoret) {
                if(photoret){

                  let insertDoc = {};
                  insertDoc.id = selfresult._str;
                  insertDoc.type = scope;
                  insertDoc.collection = "cfs.photosimg.filerecord";
                  insertDoc.objId = photoret;
                  //insertDoc['author'] = Meteor.userId();
                  insertDoc.moduleId = "meteor.communecter";
                  insertDoc.doctype = "image";
                  insertDoc.name = str;
                  insertDoc.contentKey = scope+".news";

                  Documents.insert(insertDoc, function(error, result) {
                      if (!error) {
                        console.log('result',result);

                        Router.go('newsList', {_id:scopeId,scope:scope});
                      }else{
                        console.log('error',error);
                      }
                    });
                  }
                });
              }});
            /*}else{
              //Meteor.call('push',selfresult.str);
              Router.go('newsListEvents', {_id:eventId});
            }*/
            console.log(scopeId);
            console.log(selfresult._str);
            Meteor.call('pushNewNewsAttendees',scopeId,selfresult._str);
            Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
          }
        },
        update(error, result) {
          if (error) {
            console.log("Update Error:", error);
          } else {
            console.log("Update Result:", result);
            Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
          }
        }
      }
    });

    AutoForm.addHooks(['addNew'], {
      before: {
        insert(doc, template) {
          let scope = Session.get('scope');
          let scopeId = Session.get('scopeId');
          doc.scope = {};
          doc.scope[scope] = [scopeId];
          doc.type = scope;
          return doc;
        }
      }
    });
