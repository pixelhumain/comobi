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
              }else if (urlArray && urlArray.length === 5) {
                qr.type = urlArray[2];
                qr._id = urlArray[4];
              }
            } else {
              qr=JSON.parse(result.text);
            }

            if(qr && qr.type && qr._id){
              if(qr.type=="citoyens"){

                IonPopup.confirm({title:TAPi18n.__('Scanner QRcode'),template:TAPi18n.__('Voulez vous connecter ou si non être redirigé'),
                onOk: function(){
                  Meteor.call('followPersonExist',qr._id, function (error, result) {
                    if (!error) {
                      window.alert("Connexion à l'entité réussie");
                      Router.go('detailList', {_id: qr.type,scope:qr._id});
                    }else{
                      window.alert(error.reason);
                      console.log('error',error);
                    }
                  });
                  },
                  onCancel: function(){
                    Router.go('detailList', {_id: qr.type,scope:qr._id});
                  }
                });
                
              }else if(qr.type=="events"){
                IonPopup.confirm({title:TAPi18n.__('Scanner QRcode'),template:TAPi18n.__('Voulez vous connecter ou si non être redirigé'),
                onOk: function(){
                  Meteor.call('saveattendeesEvent',qr._id, function (error, result) {
                    if (!error) {
                      window.alert("Connexion à l'entité réussie");
                      Router.go("detailList",{scope:qr.type,_id:qr._id});
                    }else{
                      window.alert(error.reason);
                      console.log('error',error);
                    }
                  });
                  },
                  onCancel: function(){
                    Router.go('detailList', {_id: qr.type,scope:qr._id});
                  }
                });
              }else if(qr.type=="organizations"){
                IonPopup.confirm({title:TAPi18n.__('Scanner QRcode'),template:TAPi18n.__('Voulez vous connecter ou si non être redirigé'),
                onOk: function(){
                  Meteor.call('connectEntity',qr._id,qr.type, function (error, result) {
                    if (!error) {
                      window.alert("Connexion à l'entité réussie");
                      Router.go("detailList",{scope:qr.type,_id:qr._id});
                    }else{
                      window.alert(error.reason);
                      console.log('error',error);
                    }
                  });
                  },
                  onCancel: function(){
                    Router.go('detailList', {_id: qr.type,scope:qr._id});
                  }
                });

              }else if(qr.type=="projects"){
                IonPopup.confirm({title:TAPi18n.__('Scanner QRcode'),template:TAPi18n.__('Voulez vous connecter ou si non être redirigé'),
                onOk: function(){
                  Meteor.call('connectEntity',qr._id,qr.type, function (error, result) {
                    if (!error) {
                      window.alert("Connexion à l'entité réussie");
                      Router.go("detailList",{scope:qr.type,_id:qr._id});
                    }else{
                      window.alert(error.reason);
                      console.log('error',error);
                    }
                  });
                  },
                  onCancel: function(){
                    Router.go('detailList', {_id: qr.type,scope:qr._id});
                  }
                });
              }
            }else{
            //Router.go("detailList",{scope:'events',_id:result.text});
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
