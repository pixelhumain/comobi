import './detail.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';

//collection
import { Events } from '../../../api/events.js';

Template.newsDetail.helpers({
  scope () {
    return Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  }
});

Template.newsDetail.events({
  "click .delete-photo" (e, t) {
    self=this;
    //let eventId = Router.current().params._id;
    let onOk=IonPopup.confirm({template:TAPi18n.__('are you sure you want to delete'),
    onOk: function(){
      Meteor.call('deletePhoto',self._id._str,function(){
        Router.go('newsList', {_id:Router.current().params._id,scope:Router.current().params.scope});
      });
    }});
    e.preventDefault();
  },
  "click .like-photo" (e, t) {
    Meteor.call('likePhoto', this._id._str);
    e.preventDefault();
  },
  "click .dislike-photo" (e, t) {
    Meteor.call('dislikePhoto', this._id._str);
    e.preventDefault();
  },
  "click .photo-viewer" (event, template) {
    event.preventDefault();
    var self = this;
    if(Meteor.isCordova){
    PhotoViewer.show(this.url());
    }
}
});
