import './pixel.html'

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import { NotificationHistory } from '../api/notification_history.js';

import './settings/settings.js';
import './notifications/notifications.js';

Template.layout.onCreated(function(){
  Meteor.subscribe('notificationsUser');
});

Template.layout.events({
  'change .all-read input' : function(event, template) {
    //console.log(event.target.checked);
    Meteor.call('allRead');
  },
  'click .scanner' : function(event, template){
    event.preventDefault();
    if(Meteor.isCordova){
      //alert(Router.current().params._id);
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if(result.cancelled==false && result.text && result.format=='QR_CODE'){
            //console.log(result.text);
            //en fonction de ce qu'il y a dans le qr code
            //ex {type:"events",_id:""}
            //alert(result.text);
            let qr=JSON.parse(result.text);
            //alert(qr);
            if(qr && qr.type && qr._id){
              if(qr.type=="person"){
                Meteor.call('followPersonExist',qr._id, function (error, result) {
                  if (!error) {
                    alert("Connexion à l'entité réussie");
                  }else{
                    alert(error.reason);
                    console.log('error',error);
                  }
                });
              }else if(qr.type=="event"){
                Meteor.call('saveattendeesEvent',qr._id);
                Router.go("newsList",{scope:'events',_id:qr._id});
              }else if(qr.type=="organization"){
                Meteor.call('connectEntity',qr._id,'organizations', function (error, result) {
                  if (!error) {
                    alert("Connexion à l'entité réussie");
                  }else{
                    alert(error.reason);
                    console.log('error',error);
                  }
                });
              }else if(qr.type=="project"){
                Meteor.call('connectEntity',qr._id,'projects', function (error, result) {
                  if (!error) {
                    alert("Connexion à l'entité réussie");
                  }else{
                    alert(error.reason);
                    console.log('error',error);
                  }
                });
              }
            }else{
            Router.go("newsList",{scope:'events',_id:result.text});
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
  }
});

Template.layout.helpers({
  notificationsCount () {
    return NotificationHistory.find({}).count();
  },
  allReadChecked (notificationsCount) {
    if(notificationsCount==0) return "checked";
  }
});
