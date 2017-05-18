import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import { ActivityStream } from '../api/activitystream.js';

import './settings/settings.js';
import './notifications/notifications.js';

import './pixel.html'

Template.layout.onCreated(function(){
  Meteor.subscribe('notificationsUser');
});

Template.layout.events({
  'change .all-read input' : function(event, template) {
    Meteor.call('allRead');
  },
  'click .all-seen' : function(event, template) {
    Meteor.call('allSeen');
  },
  'click .scanner' : function(event, template){
    event.preventDefault();
    if(Meteor.isCordova){
      cordova.plugins.barcodeScanner.scan(
        function (result) {

          if(result.cancelled==false && result.text && result.format=='QR_CODE'){
            //console.log(result.text);
            //en fonction de ce qu'il y a dans le qr code
            //ex {type:"events",_id:""} ou url
            //alert(result.text);
            let qr = {};
            if (result.text.split('#').length === 2) {
              let urlArray = result.text.split('#')[1].split('.');
              if (urlArray && urlArray.length === 4) {
                qr.type = urlArray[0];
                qr._id = urlArray[3];
              }
            } else {
              qr=JSON.parse(result.text);
            }

            if(qr && qr.type && qr._id){
              if(qr.type=="person"){
                Meteor.call('followPersonExist',qr._id, function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              }else if(qr.type=="event"){
                Meteor.call('saveattendeesEvent',qr._id, function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                    Router.go("detailList",{scope:'events',_id:qr._id});
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              }else if(qr.type=="organization"){
                Meteor.call('connectEntity',qr._id,'organizations', function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                    Router.go("detailList",{scope:'organizations',_id:qr._id});
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              }else if(qr.type=="project"){
                Meteor.call('connectEntity',qr._id,'projects', function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                    Router.go("detailList",{scope:'projects',_id:qr._id});
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              }
            }else{
            Router.go("detailList",{scope:'events',_id:result.text});
            }
          }else{
            return ;
          }
        },
        function (error) {
          window.alert("Scanning failed: " + error);
          return ;
        }
      );
    }
    return ;
  }
});

Template.layout.helpers({
  allReadChecked (notificationsCount) {
    if(notificationsCount==0) return "checked";
  },
  notifications () {
    return ActivityStream.api.isUnread();
  }
});
