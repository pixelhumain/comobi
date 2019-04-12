import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { AutoForm } from 'meteor/aldeed:autoform';
import i18n from 'meteor/universe:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { Router } from 'meteor/iron:router';
import position from '../../api/client/position.js';

// submanager
import { gamesListSubs, gamesScoreboardSubs } from '../../api/client/subsmanager.js';

import { Gamesmobile, Playersmobile, Questsmobile } from '../../api/gamemobile.js';

import { pageSession } from '../../api/client/reactive.js';

import './games.html';

/*
<button class="button button-positive button-block quest-validate-geo-js">
    <i class="icon fa fa-check"></i> {{__ "games.check_position"}}
</button>
<button class="button button-positive button-block quest-validate-js">
    <i class="icon fa fa-qrcode"></i> {{__ "games.validate"}}
</button>
<button class="button button-positive button-block quest-validate-error-js">
    <i class="icon fa fa-qrcode"></i> {{__ "games.error"}}
</button>
*/

Template.detailGames.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
    if (Router.current().route.getName() === 'gamesDetail') {
      pageSession.set('selectview', 'detailGames_view');
      const handle = gamesListSubs.subscribe('detailGames', Router.current().params._id);
      this.ready.set(handle.ready());
    } else if (Router.current().route.getName() === 'gameScoreBoard') {
      pageSession.set('selectview', 'gameScoreBoard');
      const handle = gamesScoreboardSubs.subscribe('gameScoreBoard', Router.current().params._id);
      this.ready.set(handle.ready());
    } else {
      pageSession.set('selectview', 'detailGames_view');
      const handle = gamesListSubs.subscribe('detailGames', Router.current().params._id);
      this.ready.set(handle.ready());
    }
  }.bind(this));

  this.autorun(function () {
    pageSession.set('gameId', Router.current().params._id);
  });
});

Template.detailGames.helpers({
  scope() {
    if (Router.current().params._id) {
      return Gamesmobile.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  selectview() {
    return pageSession.get('selectview');
  },
});

Template.buttonGameParticipate.events({
  'click .game-participate-js'(event) {
    event.preventDefault();
    Meteor.call('gameParticipate', { gameId: this.gameId }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
});

Template.buttonQuestValidate.events({
  'click .quest-validate-js'(event) {
    event.preventDefault();
    console.log({ gameId: this.gameId, questId: this.questId, choiceId: this.choiceId });
    Meteor.call('questValidate', { gameId: this.gameId, questId: this.questId, choiceId: this.choiceId }, (error, result) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      } else {
        if (result === 'error') {
          IonPopup.alert({
            template: i18n.__('games.wrong_answer')
          });
        } else if (result === 'valid') {
          IonPopup.alert({ template: i18n.__('games.good_answer') });
        }
      }
    });
  },
  'click .quest-validate-error-js'(event) {
    event.preventDefault();
    console.log({ gameId: this.gameId, questId: this.questId, choiceId: 'ecd1197a262518a44fda35f3' });
    Meteor.call('questValidate', { gameId: this.gameId, questId: this.questId, choiceId: 'ecd1197a262518a44fda35f3' }, (error, result) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      } else {
        if (result === 'error') {
          IonPopup.alert({
            template: i18n.__('games.wrong_answer')
          });
        } else if (result === 'valid') {
          IonPopup.alert({ template: i18n.__('games.good_answer') });
        }
      }
    });
  },
  'click .scanner-quest-validate-js'(event) {
    event.preventDefault();
    const self = this;
    if (Meteor.isCordova) {
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if (result.cancelled === false && result.text && result.format === 'QR_CODE') {
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
              Meteor.call('questValidate', { gameId: self.gameId, questId: self.questId, choiceId: qr._id }, (error, result) => {
                if (error) {
                  IonPopup.alert({ template: i18n.__(error.reason) });
                } else {
                  if (result === 'error') {
                    IonPopup.alert({
                      template: i18n.__('games.wrong_answer') });
                  } else if (result === 'valid') {
                    IonPopup.alert({ template: i18n.__('games.good_answer') });
                  }
                }
              });
            }
          } else {
            window.alert(`Scanning failed: ${error}`);
          }
        },
        function (error) {
          window.alert(`Scanning failed: ${error}`);
        },
      );
    }
  },
  'click .quest-validate-geo-js'(event) {
    event.preventDefault();
    position.locateNoFilter();
    const latlngObj = position.getLatlngObject();
    if (latlngObj) {
      Meteor.call('questValidateGeo', {
        gameId: this.gameId,
        questId: this.questId,
        latlng: latlngObj }, (error) => {
        if (error) {
          IonPopup.alert({ template: i18n.__(error.reason) });
        }
      });
    } else {
      IonPopup.alert({ template: i18n.__('not position') });
    }
  },
});

