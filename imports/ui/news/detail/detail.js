import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';

//collection
import { Events } from '../../../api/events.js';
import { Organizations } from '../../../api/organizations.js';
import { Projects } from '../../../api/projects.js';
import { Citoyens } from '../../../api/citoyens.js';

//submanager
import { singleSubs} from '../../../api/client/subsmanager.js';

import { nameToCollection } from '../../../api/helpers.js';

import './detail.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.newsDetail.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  this.autorun(function(c) {
      Session.set('scopeId', Router.current().params._id);
      Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function(c) {
      const handle = singleSubs.subscribe('scopeDetail',Router.current().params.scope,Router.current().params._id);
      const handleScopeDetail = singleSubs.subscribe('newsDetail',Router.current().params.scope,Router.current().params._id,Router.current().params.newsId);
      if(handle.ready() && handleScopeDetail.ready()){
        template.ready.set(handle.ready());
      }
  });

});

Template.newsDetail.helpers({
  scope () {
    if(Router.current().params.scope){
    const collection = nameToCollection(Router.current().params.scope);
    return collection.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    }
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.newsDetail.events({
  "click .action-news" (e, t) {
    const self=this;
    e.preventDefault();
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions News'),
      buttons: [
        { text: `${TAPi18n.__('edit')} <i class="icon ion-edit"></i>` },
      ],
      destructiveText: TAPi18n.__('delete'),
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('newsEdit', {_id:Router.current().params._id,newsId:self._id._str,scope:Router.current().params.scope});
        }
        return true;
      },
      destructiveButtonClicked: function() {
        console.log('Destructive Action!');
        Meteor.call('deleteNew',self._id._str,function(){
          Router.go('detailList', {_id:Router.current().params._id,scope:Router.current().params.scope});
        });
        return true;
      }
    });
  },
  "click .like-news" (e, t) {
    Meteor.call('likeScope', this._id._str,'news');
    e.preventDefault();
  },
  "click .dislike-news" (e, t) {
    Meteor.call('dislikeScope', this._id._str,'news');
    e.preventDefault();
  },
  "click .photo-viewer" (event, template) {
    event.preventDefault();
    var self = this;
    if(Meteor.isCordova){
      if(this.moduleId){
        const url = `${Meteor.settings.public.urlimage}/upload/${this.moduleId}/${this.folder}/${this.name}`;
        PhotoViewer.show(url);
      }

    }
}
});
