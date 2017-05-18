import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ReactiveDict } from 'meteor/reactive-dict';

//mixin
import '../mixin/button-toggle.js';

import './item.html';

Template.Directory_item.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    call: false
  });
});

Template.Directory_item.helpers({
  isConnectFunc (isConnect){
      return this && this.item && isConnect && this.item[isConnect]();
  },
  data (){
    return this;
  },
  isCall() {
  return Template.instance().state.get('call');
  }
});

Template.Directory_item.events({
  "click .disconnectscope-link-js" (evt,instance) {
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
  "click .connectscope-link-js" (evt,instance) {
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
  "click .unfollowperson-link-js" (evt,instance) {
    evt.preventDefault();
    instance.state.set('call', true);
    Meteor.call('disconnectEntity',this.id,'citoyens', (error, result)  => {
      if(error){
        instance.state.set('call', false);
        alert(err.error);
      }else{
        instance.state.set('call', false);
      }
    });
    return ;
  },
  "click .followperson-link-js" (evt,instance) {
    evt.preventDefault();
    instance.state.set('call', true);
    Meteor.call('followEntity',this.id,'citoyens', (error, result)  => {
      if(error){
        instance.state.set('call', false);
        alert(err.error);
      }else{
        instance.state.set('call', false);
      }
    });
    return ;
  }
});
