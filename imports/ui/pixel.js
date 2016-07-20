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
            Router.go("newsList",{scope:'events',_id:result.text});
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
