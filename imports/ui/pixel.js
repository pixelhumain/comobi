import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';

import { ActivityStream } from '../api/activitystream.js';

import './settings/settings.js';
import './notifications/notifications.js';

import './pixel.html';

Template.layout.onCreated(function() {
  Meteor.subscribe('notificationsUser');
});

Template.layout.events({
  'click [target=_blank]'(event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      const url = $(event.currentTarget).attr('href');
      cordova.InAppBrowser.open(url, '_system');
    }
  },
  'click [target=_system]'(event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      const url = $(event.currentTarget).attr('href');
      cordova.InAppBrowser.open(url, '_system');
    }
  },
  'change .all-read input'() {
    Meteor.call('allRead');
  },
  'click .all-seen'() {
    Meteor.call('allSeen');
  },
  'click .scanner'(event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if (result.cancelled === false && result.text && result.format === 'QR_CODE') {
            // console.log(result.text);
            // en fonction de ce qu'il y a dans le qr code
            // ex {type:"events",_id:""} ou url
            // alert(result.text);
            let qr = {};
            if (result.text.split('#').length === 2) {
              const urlArray = result.text.split('#')[1].split('.');
              if (urlArray && urlArray.length === 4) {
                qr.type = urlArray[0];
                qr._id = urlArray[3];
              } else if (urlArray && urlArray.length === 5) {
                qr.type = urlArray[2];
                qr._id = urlArray[4];
              }
            } else {
              qr = JSON.parse(result.text);
            }

            if (qr && qr.type && qr._id) {
              if (qr.type === 'citoyens') {
                Router.go('detailList', { scope: qr.type, _id: qr._id });
                IonPopup.confirm({ title: TAPi18n.__('Scanner QRcode'),
                  template: TAPi18n.__('would you like to connect to this'),
                  onOk() {
                    Meteor.call('followPersonExist', qr._id, function (error) {
                      if (!error) {
                        window.alert(TAPi18n.__('successful connection'));
                      // Router.go('detailList', {scope:qr.type,_id:qr._id});
                      } else {
                        window.alert(error.reason);
                        // console.log('error', error);
                      }
                    });
                  },
                  onCancel() {
                    // Router.go('detailList', {scope:qr.type,_id:qr._id});
                  },
                  cancelText: TAPi18n.__('no'),
                  okText: TAPi18n.__('yes'),
                });
              } else if (qr.type === 'events') {
                Router.go('detailList', { scope: qr.type, _id: qr._id });
                IonPopup.confirm({ title: TAPi18n.__('Scanner QRcode'),
                  template: TAPi18n.__('would you like to connect to this'),
                  onOk() {
                    Meteor.call('saveattendeesEvent', qr._id, function (error) {
                      if (!error) {
                        window.alert(TAPi18n.__('successful connection'));
                      // Router.go("detailList",{scope:qr.type,_id:qr._id});
                      } else {
                        window.alert(error.reason);
                        // console.log('error', error);
                      }
                    });
                  },
                  onCancel() {
                    // Router.go('detailList', {scope:qr.type,_id:qr._id});
                  },
                  cancelText: TAPi18n.__('no'),
                  okText: TAPi18n.__('yes'),
                });
              } else if (qr.type === 'organizations') {
                Router.go('detailList', { scope: qr.type, _id: qr._id });
                IonPopup.confirm({ title: TAPi18n.__('Scanner QRcode'),
                  template: TAPi18n.__('would you like to connect to this'),
                  onOk() {
                    Meteor.call('connectEntity', qr._id, qr.type, function (error) {
                      if (!error) {
                        window.alert(TAPi18n.__('successful connection'));
                      // Router.go("detailList",{scope:qr.type,_id:qr._id});
                      } else {
                        window.alert(error.reason);
                        // console.log('error', error);
                      }
                    });
                  },
                  onCancel() {
                    // Router.go('detailList', {scope:qr.type,_id:qr._id});
                  },
                  cancelText: TAPi18n.__('no'),
                  okText: TAPi18n.__('yes'),
                });
              } else if (qr.type === 'projects') {
                Router.go('detailList', { scope: qr.type, _id: qr._id });

                IonPopup.confirm({ title: TAPi18n.__('Scanner QRcode'),
                  template: TAPi18n.__('would you like to connect to this'),
                  onOk() {
                    Meteor.call('connectEntity', qr._id, qr.type, function (error) {
                      if (!error) {
                        window.alert(TAPi18n.__('successful connection'));
                      // Router.go("detailList",{scope:qr.type,_id:qr._id});
                      } else {
                        window.alert(error.reason);
                        // console.log('error', error);
                      }
                    });
                  },
                  onCancel() {
                    // Router.go('detailList', {scope:qr.type,_id:qr._id});
                  },
                  cancelText: TAPi18n.__('no'),
                  okText: TAPi18n.__('yes'),
                });
              }
            } else {
            // Router.go("detailList",{scope:'events',_id:result.text});
            }
          }
        },
        function (error) {
          window.alert(`Scanning failed: ${error}`);
        },
      );
    }
  },
});

Template.layout.helpers({
  allReadChecked (notificationsCount) {
    if (notificationsCount === 0) {
      return 'checked';
    }
    return undefined;
  },
  notifications () {
    return ActivityStream.api.isUnread();
  },
});
