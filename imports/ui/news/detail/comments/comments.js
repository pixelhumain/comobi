import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { TAPi18n } from 'meteor/tap:i18n';
import { AutoForm } from 'meteor/aldeed:autoform';
import { IonActionSheet } from 'meteor/meteoric:ionic';

// collection
import { Events } from '../../../../api/events.js';
import { Organizations } from '../../../../api/organizations.js';
import { Projects } from '../../../../api/projects.js';
import { Citoyens } from '../../../../api/citoyens.js';
import { Comments } from '../../../../api/comments.js';

// submanager
import { singleSubs } from '../../../../api/client/subsmanager.js';

import { nameToCollection } from '../../../../api/helpers.js';

import './comments.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

const pageSession = new ReactiveDict('pageComments');

Template.newsDetailComments.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.scope = Router.current().params.scope;
  template._id = Router.current().params._id;
  template.newsId = Router.current().params.newsId;
  this.autorun(function() {
    pageSession.set('scopeId', template._id);
    pageSession.set('scope', template.scope);
  });

  this.autorun(function() {
    if (template.scope && template._id && template.newsId) {
      const handle = singleSubs.subscribe('scopeDetail', template.scope, template._id);
      const handleScopeDetail = singleSubs.subscribe('newsDetailComments', template.scope, template._id, template.newsId);
      if (handle.ready() && handleScopeDetail.ready()) {
        template.ready.set(handle.ready());
      }
    }
  });
});

Template.newsDetailComments.helpers({
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

Template.newsDetailComments.events({
  'click .action-comment' (event) {
    const self = this;
    event.preventDefault();
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Comment'),
      buttons: [
        { text: `${TAPi18n.__('edit')} <i class="icon ion-edit"></i>` },
      ],
      destructiveText: TAPi18n.__('delete'),
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('commentsEdit', { _id: Router.current().params._id, newsId: Router.current().params.newsId, scope: Router.current().params.scope, commentId: self._id._str });
        }
        return true;
      },
      destructiveButtonClicked() {
        // console.log('Destructive Action!');
        Meteor.call('deleteComment', self._id._str, function() {
          Router.go('newsDetail', { _id: Router.current().params._id, newsId: Router.current().params.newsId, scope: Router.current().params.scope }, { replaceState: true });
        });
        return true;
      },
    });
  },
  'click .like-comment' (event) {
    Meteor.call('likeScope', this._id._str, 'comments');
    event.preventDefault();
  },
  'click .dislike-comment' (event) {
    Meteor.call('dislikeScope', this._id._str, 'comments');
    event.preventDefault();
  },
});


Template.commentsAdd.onCreated(function () {
  this.autorun(function() {
    pageSession.set('newsId', Router.current().params.newsId);
  });

  pageSession.set('error', false);
});

Template.commentsAdd.onRendered(function () {
  const self = this;
  pageSession.set('error', false);
  pageSession.set('queryMention', false);
  pageSession.set('mentions', false);
  self.$('textarea').atwho({
    at: '@',
    limit: 20,
    delay: 600,
    displayTimeout: 300,
    startWithSpace: true,
    displayTpl(item) {
      return item.avatar ? `<li><img src='${item.avatar}' height='20' width='20'/> ${item.name}</li>` : `<li>${item.name}</li>`;
    },
    insertTpl: '${atwho-at}${slug}',
    searchKey: 'name',
  }).on('matched.atwho', function (event, flag, query) {
    // console.log(event, "matched " + flag + " and the result is " + query);
    if (flag === '@' && query) {
      // console.log(pageSession.get('queryMention'));
      if (pageSession.get('queryMention') !== query) {
        pageSession.set('queryMention', query);
        const querySearch = {};
        querySearch.search = query;
        Meteor.call('searchMemberautocomplete', querySearch, function (error, result) {
          if (!error) {
            const citoyensArray = _.map(result.citoyens, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens' }));
            const organizationsArray = _.map(result.organizations, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations' }));
            const arrayUnions = _.union(citoyensArray, organizationsArray);
            // console.log(citoyensArray);
            self.$('textarea').atwho('load', '@', arrayUnions).atwho('run');
          }
        });
      }
    }
  })
    .on('inserted.atwho', function (event, $li) {
      // console.log(JSON.stringify($li.data('item-data')));

      if ($li.data('item-data')['atwho-at'] === '@') {
        const mentions = {};
        // const arrayMentions = [];
        mentions.name = $li.data('item-data').name;
        mentions.id = $li.data('item-data').id;
        mentions.type = $li.data('item-data').type;
        mentions.avatar = $li.data('item-data').avatar;
        mentions.value = ($li.data('item-data').slug ? $li.data('item-data').slug : $li.data('item-data').name);
        mentions.slug = ($li.data('item-data').slug ? $li.data('item-data').slug : null);
        if (pageSession.get('mentions')) {
          const arrayMentions = pageSession.get('mentions');
          arrayMentions.push(mentions);
          pageSession.set('mentions', arrayMentions);
        } else {
          pageSession.set('mentions', [mentions]);
        }
      }
    });
});

Template.commentsAdd.onDestroyed(function () {
  this.$('textarea').atwho('destroy');
});


Template.commentsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.commentsEdit.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('error', false);

  self.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('newsId', Router.current().params.newsId);
  });

  self.autorun(function() {
    const handle = singleSubs.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    const handleScopeDetail = singleSubs.subscribe('newsDetailComments', Router.current().params.scope, Router.current().params._id, Router.current().params.newsId);
    if (handle.ready() && handleScopeDetail.ready()) {
      self.ready.set(handle.ready());
    }
  });
});

Template.commentsEdit.onRendered(function () {
  const self = this;
  pageSession.set('error', false);
  pageSession.set('queryMention', false);
  pageSession.set('mentions', false);
  self.$('textarea').atwho({
    at: '@',
    limit: 20,
    delay: 600,
    displayTimeout: 300,
    startWithSpace: true,
    displayTpl(item) {
      return item.avatar ? `<li><img src='${item.avatar}' height='20' width='20'/> ${item.name}</li>` : `<li>${item.name}</li>`;
    },
    insertTpl: '${atwho-at}${slug}',
    searchKey: 'name',
  }).on('matched.atwho', function (event, flag, query) {
    // console.log(event, "matched " + flag + " and the result is " + query);
    if (flag === '@' && query) {
      // console.log(pageSession.get('queryMention'));
      if (pageSession.get('queryMention') !== query) {
        pageSession.set('queryMention', query);
        const querySearch = {};
        querySearch.search = query;
        Meteor.call('searchMemberautocomplete', querySearch, function (error, result) {
          if (!error) {
            const citoyensArray = _.map(result.citoyens, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens' }));
            const organizationsArray = _.map(result.organizations, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations' }));
            const arrayUnions = _.union(citoyensArray, organizationsArray);
            // console.log(citoyensArray);
            self.$('textarea').atwho('load', '@', arrayUnions).atwho('run');
          }
        });
      }
    }
  })
    .on('inserted.atwho', function (event, $li) {
      // console.log(JSON.stringify($li.data('item-data')));

      if ($li.data('item-data')['atwho-at'] === '@') {
        const mentions = {};
        // const arrayMentions = [];
        mentions.name = $li.data('item-data').name;
        mentions.id = $li.data('item-data').id;
        mentions.type = $li.data('item-data').type;
        mentions.avatar = $li.data('item-data').avatar;
        mentions.value = ($li.data('item-data').slug ? $li.data('item-data').slug : $li.data('item-data').name);
        mentions.slug = ($li.data('item-data').slug ? $li.data('item-data').slug : null);
        if (pageSession.get('mentions')) {
          const arrayMentions = pageSession.get('mentions');
          arrayMentions.push(mentions);
          pageSession.set('mentions', arrayMentions);
        } else {
          pageSession.set('mentions', [mentions]);
        }
      }
    });
});


Template.commentsEdit.onDestroyed(function () {
  this.$('textarea').atwho('destroy');
});

Template.commentsEdit.helpers({
  comment () {
    const comment = Comments.findOne({ _id: new Mongo.ObjectID(Router.current().params.commentId) });
    if (comment && comment.mentions) {
      pageSession.set('mentions', comment.mentions);
    }
    comment._id = comment._id._str;
    return comment;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

AutoForm.addHooks(['addComment', 'editComment'], {
  before: {
    method(doc) {
      const newsId = pageSession.get('newsId');
      doc.contextType = 'news';
      doc.contextId = newsId;
      if (pageSession.get('mentions')) {
        const arrayMentions = pageSession.get('mentions').filter(array => doc.text.match(`@${array.value}`) !== null);
        doc.mentions = arrayMentions;
      }
      return doc;
    },
    'method-update'(modifier) {
      const newsId = pageSession.get('newsId');
      modifier.$set.contextType = 'news';
      modifier.$set.contextId = newsId;
      if (pageSession.get('mentions')) {
        const arrayMentions = pageSession.get('mentions').filter(array => modifier.$set.text.match(`@${array.value}`) !== null);
        modifier.$set.mentions = arrayMentions;
      }
      return modifier;
    },
  },
  onError(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        pageSession.set('error', error.reason.replace(':', ' '));
      }
    }
  },
});

AutoForm.addHooks(['editComment'], {
  after: {
    'method-update'(error) {
      if (!error) {
        Router.go('newsDetailComments', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), newsId: pageSession.get('newsId') }, { replaceState: true });
      }
    },
  },
});
