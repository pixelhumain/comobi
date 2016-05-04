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

            IonPopup.confirm({title:TAPi18n.__('Photo'),template:TAPi18n.__('Voulez vous prendre une photo ?'),
            onOk: function(){

              MeteoricCamera.getPicture(options,function (error, data) {
                // we have a picture
                if (! error) {

                  var str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";

                  Meteor.call("cfsbase64tos3up",data,str,scope,scopeId, function (error, photoret) {
                    if(photoret){
                      Meteor.call('photoNewsUpdate',selfresult,photoret, function (error, retour) {
                        if(retour){
                          newsListSubs.reset();
                        }
                      });
                    }else{
                      console.log('error',error);
                    }

                  });

                }});

            },
            onCancel: function(){

            }
          });

              Meteor.call('pushNewNewsAttendees',scopeId,selfresult);
              Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});

          }
        },
        update : function(error, result) {
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
          doc.parentType = scope;
          doc.parentId = scopeId;

          return doc;
        }
      }
    });
