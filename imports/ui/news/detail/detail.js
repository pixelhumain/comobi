import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { IonActionSheet } from 'meteor/meteoric:ionic';

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

  this.autorun(function() {
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
    return undefined;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.newsDetail.events({
  'click .action-news' (event) {
    const self = this;
    event.preventDefault();
    IonActionSheet.show({
      titleText: i18n.__('Actions News'),
      buttons: [
        { text: `${i18n.__('edit')} <i class="icon ion-edit"></i>` },
      ],
      destructiveText: i18n.__('delete'),
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('newsEdit', { _id: Router.current().params._id, newsId: self._id._str, scope: Router.current().params.scope });
        }
        return true;
      },
      destructiveButtonClicked() {
        // console.log('Destructive Action!');
        Meteor.call('deleteNew', self._id._str, function() {
          // window.history.back();
          Router.go('actusList', { _id: Router.current().params._id, scope: Router.current().params.scope }, { replaceState: true });
        });
        return true;
      },
    });
  },
  'click .like-news' (event) {
    Meteor.call('likeScope', this._id._str, 'news');
    event.preventDefault();
  },
  'click .dislike-news' (event) {
    Meteor.call('dislikeScope', this._id._str, 'news');
    event.preventDefault();
  },
  'click .photo-viewer' (event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      if (this.moduleId) {
        const url = `${Meteor.settings.public.urlimage}/upload/${this.moduleId}/${this.folder}/${this.name}`;
        PhotoViewer.show(url);
      }
    }
  },
});
