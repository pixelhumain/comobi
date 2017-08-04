import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';

//collection
import { Events } from '../../../../api/events.js';
import { Organizations } from '../../../../api/organizations.js';
import { Projects } from '../../../../api/projects.js';
import { Citoyens } from '../../../../api/citoyens.js';
import { News } from '../../../../api/news.js';
import { Comments } from '../../../../api/comments.js';

//submanager
import { singleSubs} from '../../../../api/client/subsmanager.js';

import { nameToCollection } from '../../../../api/helpers.js';

import './comments.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

let pageSession = new ReactiveDict('pageComments');

Template.newsDetailComments.onCreated(function () {
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
    if(template.scope && template._id && template.newsId){
      const handle = singleSubs.subscribe('scopeDetail',template.scope,template._id);
      const handleScopeDetail = singleSubs.subscribe('newsDetailComments', template.scope,template._id,template.newsId);
      if(handle.ready() && handleScopeDetail.ready()){
        template.ready.set(handle.ready());
      }
    }
  });

});

Template.newsDetailComments.helpers({
  scope () {
    if(Template.instance().scope && Template.instance()._id && Template.instance().newsId && Template.instance().ready.get()){
    const collection = nameToCollection(Template.instance().scope);
    return collection.findOne({_id:new Mongo.ObjectID(Template.instance()._id)});
    }
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.newsDetailComments.events({
  "click .action-comment" (e, t) {
    const self=this;
    e.preventDefault();
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Comment'),
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
          Router.go('commentsEdit', {_id:Router.current().params._id,newsId:Router.current().params.newsId,scope:Router.current().params.scope,commentId:self._id._str});
        }
        return true;
      },
      destructiveButtonClicked: function() {
        console.log('Destructive Action!');
        Meteor.call('deleteComment',self._id._str,function(){
          Router.go('newsDetail', {_id:Router.current().params._id,newsId:Router.current().params.newsId,scope:Router.current().params.scope});
        });
        return true;
      }
    });
  },
  "click .like-comment" (e, t) {
    Meteor.call('likeScope', this._id._str,'comments');
    e.preventDefault();
  },
  "click .dislike-comment" (e, t) {
    Meteor.call('dislikeScope', this._id._str,'comments');
    e.preventDefault();
  }
});



Template.commentsAdd.onCreated(function () {
  this.autorun(function() {
    Session.set('newsId', Router.current().params.newsId);
  });

  pageSession.set( 'error', false );
});

Template.commentsAdd.onRendered(function () {
  pageSession.set( 'error', false );
});

Template.commentsAdd.helpers({
  error () {
    return pageSession.get( 'error' );
  }
});

Template.commentsEdit.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set( 'error', false );

  self.autorun(function(c) {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
    Session.set('newsId', Router.current().params.newsId);
  });

  self.autorun(function(c) {
    const handle = singleSubs.subscribe('scopeDetail',Router.current().params.scope,Router.current().params._id);
    const handleScopeDetail = singleSubs.subscribe('newsDetailComments',Router.current().params.scope,Router.current().params._id,Router.current().params.newsId);
      if(handle.ready() && handleScopeDetail.ready()){
        self.ready.set(handle.ready());
      }
  });

});

Template.commentsEdit.onRendered(function () {
  pageSession.set( 'error', false );
});

Template.commentsEdit.helpers({
  comment () {
    return Comments.findOne({_id:new Mongo.ObjectID(Router.current().params.commentId)});
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

AutoForm.addHooks(['addComment', 'editComment'], {
  before: {
    method : function(doc, template) {
      let newsId = Session.get('newsId');
      doc.contextType = 'news';
      doc.contextId = newsId;
      return doc;
    },
    "method-update" : function(modifier, documentId) {
      let newsId = Session.get('newsId');
      modifier["$set"].contextType = 'news';
      modifier["$set"].contextId = newsId;
      return modifier;
    }
  },
  onError: function(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === "error_call") {
        pageSession.set( 'error', error.reason.replace(":", " "));
      }
    }
  }
});

AutoForm.addHooks(['editComment'], {
  after: {
    "method-update" : function(error, result) {
      if (!error) {
        Router.go('newsDetailComments', {_id: Session.get('scopeId'),scope:Session.get('scope'),newsId:Session.get('newsId')});
      }
    }
  }
});
