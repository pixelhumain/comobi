import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';

// collection
import { Events } from '../../../api/events.js';
import { Organizations } from '../../../api/organizations.js';
import { Projects } from '../../../api/projects.js';
import { Citoyens } from '../../../api/citoyens.js';

// submanager
import { singleSubs } from '../../../api/client/subsmanager.js';

import { nameToCollection } from '../../../api/helpers.js';

import './detail.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.newsDetail.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.scope = Router.current().params.scope;
  template._id = Router.current().params._id;
  template.newsId = Router.current().params.newsId;
  this.autorun(function(c) {
    Session.set('scopeId', template._id);
    Session.set('scope', template.scope);
  });

  this.autorun(function(c) {
    if (template.scope && template._id && template.newsId) {
      const handle = singleSubs.subscribe('scopeDetail', template.scope, template._id);
      const handleScopeDetail = singleSubs.subscribe('newsDetail', template.scope, template._id, template.newsId);
      if (handle.ready() && handleScopeDetail.ready()) {
        template.ready.set(handle.ready());
      }
    }
  });
});

Template.newsDetail.helpers({
  scope () {
    if (Template.instance().scope && Template.instance()._id && Template.instance().newsId && Template.instance().ready.get()) {
      const collection = nameToCollection(Template.instance().scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Template.instance()._id) });
    }
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.newsDetail.events({
  'click .action-news' (e, t) {
    const self = this;
    e.preventDefault();
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions News'),
      buttons: [
        { text: `${TAPi18n.__('edit')} <i class="icon ion-edit"></i>` },
      ],
      destructiveText: TAPi18n.__('delete'),
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('newsEdit', { _id: Router.current().params._id, newsId: self._id._str, scope: Router.current().params.scope });
        }
        return true;
      },
      destructiveButtonClicked() {
        console.log('Destructive Action!');
        Meteor.call('deleteNew', self._id._str, function() {
          Router.go('detailList', { _id: Router.current().params._id, scope: Router.current().params.scope });
        });
        return true;
      },
    });
  },
  'click .like-news' (e, t) {
    Meteor.call('likeScope', this._id._str, 'news');
    e.preventDefault();
  },
  'click .dislike-news' (e, t) {
    Meteor.call('dislikeScope', this._id._str, 'news');
    e.preventDefault();
  },
  'click .photo-viewer' (event, template) {
    event.preventDefault();
    const self = this;
    if (Meteor.isCordova) {
      if (this.moduleId) {
        const url = `${Meteor.settings.public.urlimage}/upload/${this.moduleId}/${this.folder}/${this.name}`;
        PhotoViewer.show(url);
      }
    }
  },
});
