import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';

// mixin
import '../mixin/button-toggle.js';

import './item.html';

Template.Directory_item.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    call: false,
  });
});

Template.Directory_item.helpers({
  isConnectFunc (isConnect) {
    return this && this.item && isConnect && this.item[isConnect]();
  },
  data () {
    return this;
  },
  isCall() {
    return Template.instance().state.get('call');
  },
  classes () {
    const classes = ['item item-avatar animated out'];
    classes.push('item-button-right');
    if (this.class) {
      const customClasses = this.class.split(' ');
      customClasses.forEach(function (customClass) {
        classes.push(customClass);
      });
    }

    return classes.join(' ');
  },
});

Template.Directory_item.events({
  'click .disconnectscope-link-js' (event, instance) {
    event.preventDefault();
    const self = this;
    instance.state.set('call', true);
    IonPopup.confirm({ title: TAPi18n.__('Disconnect'),
      template: TAPi18n.__('Want to remove the link between you and the entity'),
      onOk() {
        Meteor.call('disconnectEntity', self.id, self.scope, (error) => {
          if (error) {
            instance.state.set('call', false);
            IonPopup.alert({ template: TAPi18n.__(error.reason) });
          } else {
            instance.state.set('call', false);
          }
        });
      },
      onCancel() {
        instance.state.set('call', false);
      },
      cancelText: TAPi18n.__('No'),
      okText: TAPi18n.__('Yes'),
    });
  },
  'click .connectscope-link-js' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('connectEntity', this.id, this.scope, (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .connectscopeadmin-link-js' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('connectEntity', this.id, this.scope, this.childId, 'admin', (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .unfollowperson-link-js' (event, instance) {
    event.preventDefault();
    const self = this;
    instance.state.set('call', true);
    IonPopup.confirm({ title: TAPi18n.__('Unfollow'),
      template: TAPi18n.__('no longer follow this entity'),
      onOk() {
        Meteor.call('disconnectEntity', self.id, 'citoyens', (error) => {
          if (error) {
            instance.state.set('call', false);
            IonPopup.alert({ template: TAPi18n.__(error.reason) });
          } else {
            instance.state.set('call', false);
          }
        });
      },
      onCancel() {
        instance.state.set('call', false);
      },
      cancelText: TAPi18n.__('No'),
      okText: TAPi18n.__('Yes'),
    });
  },
  'click .followperson-link-js' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('followEntity', this.id, 'citoyens', (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .favorites-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('collectionsAdd', this.id, this.scope, (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .invitations-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    // invitationScope (parentId, parentType, connectType, childType, childEmail, childName, childId)
    let connectType = null;
    if (this.connectType) {
      connectType = this.connectType;
    }
    Meteor.call('invitationScope', this.id, this.scope, connectType, this.childType, null, null, this.childId, (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
});
