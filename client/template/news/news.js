newsListSubs = new SubsManager();
Session.setDefault('limit', 5);

Template.newsList.onCreated(function(){
  self = this;
  self.ready = new ReactiveVar();
  self.autorun(function() {
    if (!!Session.get('limit')) {
      var handle = newsListSubs.subscribe('newsList', 'events', Router.current().params._id,Session.get('limit'));
      self.ready.set(handle.ready());
    }
  });
});

Template.newsList.onRendered(function(){
  self = this;
  const showMoreVisible = () => {
    let threshold, target = $("#showMoreResults");
    if (!target.length) return;
    threshold = $('.content.overflow-scroll').scrollTop() + $('.content.overflow-scroll').height();
    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("visible", true);
        Session.set("limit",
        Session.get('limit') + 5);
      }
    } else {
      if (target.data("visible")) {
        target.data("visible", false);
      }
    }
  }

  $('.content.overflow-scroll').scroll(showMoreVisible);

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
  },
  countNews () {
    console.log(Router.current().params._id)
    return Counts.get(`countNews.${Router.current().params._id}`);
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
          insertNew.id = self._id._str;
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

  },
  "click .photo-link-new" (event, template) {
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
        Meteor.call("photoNews",data,str,scope,self._id._str, function (error, result) {
          if (!error) {
            console.log('result',result);
            Meteor.call('pushNewNewsAttendees',self._id._str,result.newsId);
            Router.go('newsList', {_id:self._id._str,scope:scope});
          }else{
            console.log('error',error);
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

AutoForm.addHooks(['addNew', 'editNew'], {
  after: {
    method : function(error, result) {
      if (error) {
        console.log("Insert Error:", error);
      } else {
        if (error) {
          console.log("Insert Error:", error);
        } else {
          console.log("Insert Result:", JSON.stringify(result.data.id["$id"]));

          var self = this;
          var selfresult=result.data.id["$id"];
          var scopeId=Session.get('scopeId');
          var scope=Session.get('scope');
          var options = {
            width: 500,
            height: 500,
            quality: 75
          };

          MeteoricCamera.getPicture(options,function (error, data) {
            // we have a picture
            if (! error) {

              var str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";

              Meteor.call("cfsbase64tos3up",data,str,scope,scopeId, function (error, photoret) {
                if(photoret){

                  let insertDoc = {};
                  insertDoc.id = selfresult;
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

          console.log(scopeId);
          console.log(selfresult._str);
          Meteor.call('pushNewNewsAttendees',scopeId,selfresult);
          Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
        }
      }
    },
    "method-update" : function(error, result) {
      if (error) {
        console.log("Update Error:", error);
      } else {
        if (error) {
          console.log("Update Error:", error);
        } else {
          console.log("Update Result:", result);
          Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
        }
      }
    }
  },
  onError: function(formType, error) {
    let ref;
    if (error.errorType && error.errorType === 'Meteor.Error') {
      //if ((ref = error.reason) === 'Name must be unique') {
      //this.addStickyValidationError('name', error.reason);
      //AutoForm.validateField(this.formId, 'name');
      //}
    }
  }
});

AutoForm.addHooks(['addNew'], {
  before: {
    method : function(doc, template) {
      console.log(doc);
      let scope = Session.get('scope');
      let scopeId = Session.get('scopeId');
      doc.type = scope;
      doc.typeId = scopeId;
      return doc;
    }
  }
});

/*AutoForm.addHooks(['addNew', 'editNew'], {
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
      doc.id = scopeId;
      return doc;
    }
  }
});*/
