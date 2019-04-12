import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import i18n from 'meteor/universe:i18n';
import { $ } from 'meteor/jquery';
import { IonPopup } from 'meteor/meteoric:ionic';

import { ActivityStream } from '../../api/activitystream.js';

// submanager
import { singleSubs } from '../../api/client/subsmanager.js';

import './notifications.html';

Template.notifications.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function() {
    const handle = singleSubs.subscribe('notificationsUser');
    self.ready.set(handle.ready());
  });
});

Template.notificationsListSwip.onRendered(function () {
  const self = this;
  self.autorun(function (c) {
    if (self.data && self.data.notifications) {
      const list = self.$('.list')[0];
      const slip = new Slip(list);
      c.stop();
    }
  });
});

Template.notificationsListSwip.events({
  'slip:beforeswipe .list .no-swipe'(event) {
    event.preventDefault();
  },
  'slip:afterswipe .list .item'(event) {
    // console.log('slip:afterswipe');
    event.preventDefault();
  },
  'slip:swipe .list .item'(event) {
    // console.log('slip:swipe');
    // console.log(this._id._str);
    // console.log('slip:remove');
    event.target.parentNode.removeChild(event.target);
    Meteor.call('markRead', this._id._str);
  },
  'slip:beforewait .list .item'() {
    // console.log('slip:beforewait');
  },
});

Template.notificationsListSwipMenu.inheritsHelpersFrom('notificationsListSwip');
Template.notificationsListSwipMenu.inheritsEventsFrom('notificationsListSwip');
Template.notificationsListSwipMenu.inheritsHooksFrom('notificationsListSwip');


Template.notifications.helpers({
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.notifications.helpers({
  notifications () {
    return ActivityStream.api.isUnread();
  },
});


Template.notificationsList.events({
  'click .validateYes'(event) {
    event.preventDefault();
    // console.log(`${this.target.id},${this.target.type},${this.authorId()}`);
    Meteor.call('validateEntity', this.target.id, this.target.type, this.authorId(), 'citoyens', 'toBeValidated', function(err) {
      if (err) {
        if (err.reason) {
          IonPopup.alert({ template: i18n.__(err.reason) });
        }
      } else {
        // console.log('yes validate');
      }
    });
  },
  'click .validateNo'(event) {
    event.preventDefault();
    // console.log(this._id._str);
    Meteor.call('disconnectEntity', this.target.id, this.target.type, undefined, this.authorId(), 'citoyens', function(err) {
      if (err) {
        if (err.reason) {
          IonPopup.alert({ template: i18n.__(err.reason) });
        }
      } else {
        // console.log('no validate');
      }
    });
  },
  'click .removeMe'(event) {
    event.preventDefault();
    // console.log(this._id._str);
    Meteor.call('markRead', this._id._str);
  },
  'click .clickGo'(event) {
    event.preventDefault();
    // console.log(this._id._str);
    Meteor.call('markSeen', this._id._str);

    /* const VERB_VIEW = 'view';
    const VERB_ADD = 'add';
    const VERB_UPDATE = 'update';
    const VERB_CREATE = 'create';
    const VERB_DELETE = 'delete';

    const VERB_JOIN = 'join';
    const VERB_WAIT = 'wait';
    const VERB_LEAVE = 'leave';
    const VERB_INVITE = 'invite';
    const VERB_ACCEPT = 'accept';
    const VERB_CLOSE = 'close';
    const VERB_SIGNIN = 'signin';

    const VERB_HOST = 'host';
    const VERB_FOLLOW = 'follow';
    const VERB_CONFIRM = 'confirm';
    const VERB_AUTHORIZE = 'authorize';
    const VERB_ATTEND = 'attend';
    const VERB_COMMENT = 'comment';
    const VERB_MENTION = 'mention';
    const VERB_ADDROOM = 'addactionroom';
    const VERB_ADD_PROPOSAL = 'addproposal';
    const VERB_MODERATE = 'moderate';
    const VERB_ADD_ACTION = 'addaction';
    const VERB_VOTE = 'vote';

    const VERB_POST = 'post';
    const VERB_RETURN = 'return';
    */


    if (this.verb === 'comment') {
      if (this.target.type === 'news') {
        Router.go('newsDetailComments', { _id: this.target.parent.id, newsId: this.target.id, scope: this.target.parent.type });
      }
      if (this.object.type === 'proposals' || this.object.type === 'actions') {
        const regex = /page\/type\/([^/]*)\/id\/([^/]*)\/view\/coop\/room\/([^/]*)\/([^/]*)\/([a-z0-9]*)/g;
        const m = regex.exec(this.notify.url);
        if (m && m[0] && m[1] && m[2] && m[3] && m[4] && m[5]) {
          if (m[4] === 'proposal') {
            Router.go('proposalsDetailComments', { _id: m[2], scope: m[1], roomId: m[3], proposalId: m[5] });
          } else if (m[4] === 'action') {
            Router.go('actionsDetailComments', { _id: m[2], scope: m[1], roomId: m[3], actionId: m[5] });
          }
        }
      }
    } else if (this.verb === 'like') {
      if (this.target.type === 'news') {
        Router.go('newsDetail', { _id: this.target.parent.id, newsId: this.target.id, scope: this.target.parent.type });
      }
    } else if (this.verb === 'post') {
      if (this.target.type === 'citoyens' || this.target.type === 'projects' || this.target.type === 'organizations' || this.target.type === 'events') {
        if (this.notify.objectType === 'news') {
          Router.go('newsList', { _id: this.target.id, scope: this.target.type });
        }
      }
    } else if (this.verb === 'mention') {
      if (this.target.type === 'citoyens' || this.target.type === 'projects' || this.target.type === 'organizations' || this.target.type === 'events') {
        Router.go('newsDetail', { _id: this.target.id, newsId: this.object.id, scope: this.target.type });
      }
    } else if (this.verb === 'join' || this.verb === 'ask' || this.verb === 'follow' || this.verb === 'accept' || this.verb === 'wait' || this.verb === 'confirm' || this.verb === 'invite' || this.verb === 'authorize' || this.verb === 'attend') {
      if (this.target.type === 'citoyens' || this.target.type === 'projects' || this.target.type === 'organizations' || this.target.type === 'events') {
        if (this.target.id) {
          Router.go('detailList', { _id: this.target.id, scope: this.target.type });
        }
      }
    } else if (this.verb === 'ammend' || this.verb === 'vote' || this.verb === 'addaction' || this.verb === 'addproposal' || this.verb === 'addresolution' || this.verb === 'addactionroom') {
      if (this.target.type === 'projects' || this.target.type === 'organizations' || this.target.type === 'events') {
        if (this.target.id) {
          // analyser url
          // this.notify.url
          // page\/type\/${this.target.type}\/id\/${this.target.id}\/view\/coop\/room\/([^/]*)\/proposal\/${this.object.id}
          const regex = /page\/type\/([^/]*)\/id\/([^/]*)\/view\/coop\/room\/([^/]*)\/([^/]*)\/([a-z0-9]*)/g;
          const m = regex.exec(this.notify.url);
          if (m && m[0] && m[1] && m[2] && m[3] && m[4] && m[5]) {
            if (m[4] === 'proposal') {
              Router.go('proposalsDetail', { _id: m[2], scope: m[1], roomId: m[3], proposalId: m[5] });
            } else if (m[4] === 'resolution') {
              Router.go('resolutionsDetail', { _id: m[2], scope: m[1], roomId: m[3], resolutionId: m[5] });
            } else if (m[4] === 'action') {
              Router.go('actionsDetail', { _id: m[2], scope: m[1], roomId: m[3], actionId: m[5] });
            }
          }
        }
      }
    }
  },
});
