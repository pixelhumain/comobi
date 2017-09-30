import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';

// mixin
import '../mixin/button-toggle.js';

import './button-card.html';

Template.Bouton_card.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    call: false,
  });
});

Template.Bouton_card.helpers({
  isCall() {
    return Template.instance().state.get('call');
  },
});

Template.Bouton_card.events({
  'click .saveattendees-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('saveattendeesEvent', this.id, (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .inviteattendees-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('inviteattendeesEvent', this.id, (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .connectscope-link' (event, instance) {
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
  'click .disconnectscopeadmin-link-js' (event, instance) {
    event.preventDefault();
    const self = this;
    instance.state.set('call', true);
    IonPopup.confirm({ title: TAPi18n.__('Disconnect'),
      template: TAPi18n.__('Want to remove the link between the entity'),
      onOk() {
        Meteor.call('disconnectEntity', self.id, self.scope, null, this.childId, this.childType, (error) => {
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
  'click .validatescope-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('validateEntity', this.id, this.scope, Meteor.userId(), 'citoyens', 'isInviting', (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .disconnectscope-link' (event, instance) {
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
  'click .followperson-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('followEntity', this.id, this.scope, (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .unfollowperson-link' (event, instance) {
    event.preventDefault();
    const self = this;
    instance.state.set('call', true);
    IonPopup.confirm({ title: TAPi18n.__('Unfollow'),
      template: TAPi18n.__('no longer follow that person'),
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
  'click .unfollowscope-link' (event, instance) {
    event.preventDefault();
    const self = this;
    instance.state.set('call', true);
    IonPopup.confirm({ title: TAPi18n.__('Unfollow'),
      template: TAPi18n.__('no longer follow this entity'),
      onOk() {
        Meteor.call('disconnectEntity', self.id, self.scope, 'followers', (error) => {
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
