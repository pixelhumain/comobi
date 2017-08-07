import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

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
        alert(error.error);
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
        alert(error.error);
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
        alert(error.error);
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .disconnectscope-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('disconnectEntity', this.id, this.scope, (error) => {
      if (error) {
        instance.state.set('call', false);
        alert(error.error);
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .followperson-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('followEntity', this.id, this.scope, (error) => {
      if (error) {
        instance.state.set('call', false);
        alert(error.error);
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .unfollowperson-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('disconnectEntity', this.id, this.scope, (error) => {
      if (error) {
        instance.state.set('call', false);
        alert(error.error);
      } else {
        instance.state.set('call', false);
      }
    });
  },
  'click .unfollowscope-link' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('disconnectEntity', this.id, this.scope, 'followers', (error) => {
      if (error) {
        instance.state.set('call', false);
        alert(error.error);
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
        alert(error.error);
      } else {
        instance.state.set('call', false);
      }
    });
  },

});
