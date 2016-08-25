import './news.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';
//import { MeteoricCamera } from 'meteor/meteoric:camera';
import { MeteorCameraUI } from 'meteor/aboire:camera-ui';
import { AutoForm } from 'meteor/aldeed:autoform';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';

import '../qrcode/qrcode.js'

//submanager
import { newsListSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { News } from '../../api/news.js';

let pageSession = new ReactiveDict('pageNews');

Session.setDefault('limit', 5);

Template.newsList.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();
  this.autorun(function() {
    if (!!Session.get('limit')) {
      var handle = newsListSubs.subscribe('newsList', 'events', Router.current().params._id,Session.get('limit'));
      this.ready.set(handle.ready());
    }
  }.bind(this));
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
    return Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  },
  scopeCardTemplate () {
    return  'listCard'+Session.get('scope');
  },
  isLimit (countNews) {
    return  countNews > Session.get('limit');
  },
  countNews () {
    //console.log(Router.current().params._id)
    return Counts.get(`countNews.${Router.current().params._id}`);
  },
  isVote () {
    return  this.type == "vote";
  },
});


Template.newsList.events({
  "click .saveattendees-link" (evt) {
    evt.preventDefault();
    let scopeId=Session.get('scopeId');
    Meteor.call('saveattendeesEvent',scopeId);
    return ;
  },
  "click .inviteattendees-link" (evt) {
    evt.preventDefault();
    let scopeId=Session.get('scopeId');
    Meteor.call('inviteattendeesEvent',scopeId);
    return ;
  },
  'click .scanner-event' : function(event, template){
    event.preventDefault();
    if(Meteor.isCordova){
      const scopeId=Session.get('scopeId');
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if(result.cancelled==false && result.text && result.format=='QR_CODE'){
            let qr=JSON.parse(result.text);
            //alert(qr);
            if(qr && qr.type && qr._id){
              if(qr.type=="person"){
                Meteor.call('saveattendeesEvent', scopeId, undefined, qr._id, function (error, result) {
                  if (!error) {
                    alert("Connexion à l'entité réussie");
                  }else{
                    alert(error.reason);
                    console.log('error',error);
                  }
                });
              }
            }
          }else{
            return ;
          }
        },
        function (error) {
          alert("Scanning failed: " + error);
          return ;
        }
      );
    }
    return ;
  },
  "click .give-me-more" (evt) {
    let newLimit = Session.get('limit') + 10;
    Session.set('limit', newLimit);
  },
  "click .photo-link-new" (event, template) {
    var self = this;
    let scopeId=Session.get('scopeId');
    let scope=Session.get('scope');
    let options = {
      width: 500,
      height: 500,
      quality: 75
    };
    MeteorCameraUI.getPicture(options,function (error, data) {
      if (! error) {
        let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
        Meteor.call("photoNews",data,str,scope,self._id._str, function (error, result) {
          if (!error) {
            //console.log('result',result);
            Meteor.call('pushNewNewsAttendees',self._id._str,result.newsId);
            Router.go('newsList', {_id:self._id._str,scope:scope});
          }else{
            //console.log('error',error);
          }
        });
      }});

    },
    "click .photo-link-event" (event, template) {
      event.preventDefault();
      var self = this;
      let scopeId=Session.get('scopeId');
      let scope=Session.get('scope');
      let options = {
        width: 500,
        height: 500,
        quality: 75
      };
      MeteorCameraUI.getPicture(options,function (error, data) {
        if (! error) {
          let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
          let dataURI = data;
          Meteor.call("photoEvents",data,str,self._id._str, function (error, result) {
            if (!error) {

            }else{
              //console.log('error',error);
            }
          });
        }});

      }
    });

    Template.newsAdd.onCreated(function () {
      pageSession.set( 'error', false );
    });

    Template.newsAdd.onRendered(function () {
      pageSession.set( 'error', false );
    });

    Template.newsAdd.helpers({
      error () {
        return pageSession.get( 'error' );
      }
    });

    Template.newsEdit.onCreated(function () {
      pageSession.set( 'error', false );
    });

    Template.newsEdit.onRendered(function () {
      pageSession.set( 'error', false );
    });

    Template.newsEdit.helpers({
      new () {
        return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
      },
      error () {
        return pageSession.get( 'error' );
      }
    });

    AutoForm.addHooks(['addNew', 'editNew'], {
      after: {
        method : function(error, result) {
          if (!error) {
            var self = this;
            let selfresult=result.data.id["$id"];
            let scopeId=Session.get('scopeId');
            let scope=Session.get('scope');

            let options = {
              width: 500,
              height: 500,
              quality: 75
            };

            IonPopup.confirm({title:TAPi18n.__('Photo'),template:TAPi18n.__('Voulez vous prendre une photo ?'),
            onOk: function(){

              MeteorCameraUI.getPicture(options,function (error, data) {
                // we have a picture
                if (! error) {

                  let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";

                  Meteor.call("cfsbase64tos3up",data,str,scope,scopeId, function (error, photoret) {
                    if(photoret){
                      Meteor.call('photoNewsUpdate',selfresult,photoret, function (error, retour) {
                        if(retour){
                          newsListSubs.reset();
                        }
                      });
                    }else{
                      //console.log('error',error);
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
        "method-update" : function(error, result) {
          if (!error) {
            Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
          }
        }
      },
      before: {
        method : function(doc, template) {
          //console.log(doc);
          let scope = Session.get('scope');
          let scopeId = Session.get('scopeId');
          doc.parentType = scope;
          doc.parentId = scopeId;
          return doc;
        },
        "method-update" : function(modifier, documentId) {
          let scope = Session.get('scope');
          let scopeId = Session.get('scopeId');
          modifier["$set"].parentType = scope;
          modifier["$set"].parentId = scopeId;
          return modifier;
        }
      },
      onError: function(formType, error) {
        if (error.errorType && error.errorType === 'Meteor.Error') {
          if (error && error.error === "error_call") {
            pageSession.set( 'error', error.reason.replace(":", " "));
          }
        }
        //let ref;
        //if (error.errorType && error.errorType === 'Meteor.Error') {
        //if ((ref = error.reason) === 'Name must be unique') {
        //this.addStickyValidationError('name', error.reason);
        //AutoForm.validateField(this.formId, 'name');
        //}
        //}
      }
    });

    Template._inviteattendeesEvent.onCreated(function () {
      pageSession.set( 'error', false );
      pageSession.set( 'invitedUserEmail', false);
    });

    Template._inviteattendeesEvent.onRendered(function () {
      pageSession.set( 'error', false );
      pageSession.set( 'invitedUserEmail', false);
    });

    Template._inviteattendeesEvent.helpers({
      error () {
        return pageSession.get( 'error' );
      }
    });

    AutoForm.addHooks(['inviteAttendeesEvent'], {
      before: {
        method : function(doc, template) {
          let scopeId = Session.get('scopeId');
          doc.eventId = scopeId;
          pageSession.set( 'invitedUserEmail', doc.invitedUserEmail);
          return doc;
        }
      },
      after: {
        method : function(error, result) {
          if (!error) {
            IonModal.close();
          }
        }
      },
      onError: function(formType, error) {
        //console.log(error);
        if (error.errorType && error.errorType === 'Meteor.Error') {
          if (error && error.error === "error_call") {
            if( error.reason == "Problème à l'insertion du nouvel utilisateur : une personne avec cet mail existe déjà sur la plateforme"){
              Meteor.call('saveattendeesEvent',Session.get('scopeId'),pageSession.get( 'invitedUserEmail'),function(error,result){
                if(error){
                  pageSession.set( 'error', error.reason.replace(":", " "));
                }else{
                  IonModal.close();
                }
              });
            }
          }else{
            pageSession.set( 'error', error.reason.replace(":", " "));
          }
        }
      }
    });
