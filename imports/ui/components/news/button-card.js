import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ReactiveDict } from 'meteor/reactive-dict';

//mixin
import '../mixin/button-toggle.js';

import './button-card.html';

Template.Bouton_card.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    call: false
  });
});

Template.Bouton_card.helpers({
  isCall() {
  return Template.instance().state.get('call');
  }
});

Template.Bouton_card.events({
  "click .saveattendees-link" (evt,instance) {
    evt.preventDefault();
    instance.state.set('call', true);
    Meteor.call('saveattendeesEvent',this.id, (error, result)  => {
      if(error){
        instance.state.set('call', false);
        alert(err.error);
      }else{
        instance.state.set('call', false);
      }
    });
    return ;
  },
  "click .inviteattendees-link" (evt,instance) {
    evt.preventDefault();
    instance.state.set('call', true);
    Meteor.call('inviteattendeesEvent',this.id, (error, result)  => {
      if(error){
        instance.state.set('call', false);
        alert(err.error);
      }else{
        instance.state.set('call', false);
      }
    });
    return ;
  },
  "click .connectscope-link" (evt,instance) {
    evt.preventDefault();
    instance.state.set('call', true);
    Meteor.call('connectEntity',this.id,this.scope, (error, result)  => {
      if(error){
        instance.state.set('call', false);
        alert(err.error);
      }else{
        instance.state.set('call', false);
      }
    });
    return ;
  },
  "click .disconnectscope-link" (evt,instance) {
    evt.preventDefault();
    instance.state.set('call', true);
    Meteor.call('disconnectEntity',this.id,this.scope, (error, result)  => {
      if(error){
        instance.state.set('call', false);
        alert(err.error);
      }else{
        instance.state.set('call', false);
      }
    });
    return ;
  },
  "click .followperson-link" (evt,instance) {
    evt.preventDefault();
    instance.state.set('call', true);
    Meteor.call('followEntity',this.id,this.scope, (error, result)  => {
      if(error){
        instance.state.set('call', false);
        alert(err.error);
      }else{
        instance.state.set('call', false);
      }
    });
  return ;
},
"click .unfollowperson-link" (evt,instance) {
  evt.preventDefault();
  instance.state.set('call', true);
  Meteor.call('disconnectEntity',this.id,this.scope, (error, result)  => {
    if(error){
      instance.state.set('call', false);
      alert(err.error);
    }else{
      instance.state.set('call', false);
    }
  });
return ;
},
"click .unfollowscope-link" (evt,instance) {
  evt.preventDefault();
  instance.state.set('call', true);
  Meteor.call('disconnectEntity',this.id,this.scope,'followers', (error, result)  => {
    if(error){
      instance.state.set('call', false);
      alert(err.error);
    }else{
      instance.state.set('call', false);
    }
  });
return ;
},
"click .favorites-link" (evt,instance) {
  evt.preventDefault();
  instance.state.set('call', true);
  Meteor.call('collectionsAdd',this.id,this.scope, (error, result)  => {
    if(error){
      instance.state.set('call', false);
      alert(err.error);
    }else{
      instance.state.set('call', false);
    }
  });
return ;
},

});
