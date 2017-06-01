import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';

//collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { News } from '../../api/news.js';

//submanager
import { singleSubs} from '../../api/client/subsmanager.js';

import { nameToCollection } from '../../api/helpers.js';

import './share.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

let pageSession = new ReactiveDict('pageShare');

Template.share.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  this.autorun(function(c) {
      Session.set('scopeId', Router.current().params._id);
      Session.set('scope', Router.current().params.scope);
      if(Router.current().params.newsId){
        Session.set('newsId', Router.current().params.newsId);
      }
  });
  /* share peut être : event,project,organization
  mais aussi une news

  */
  this.autorun(function(c) {
    if(Router.current().params.newsId){
      const handle = singleSubs.subscribe('scopeDetail',Router.current().params.scope,Router.current().params._id);
      const handleScopeDetail = singleSubs.subscribe('newsDetail',Router.current().params.scope,Router.current().params._id,Router.current().params.newsId);
      if(handle.ready() && handleScopeDetail.ready()){
        console.log('subici');
        template.ready.set(handle.ready());
      }
    }else{
      const handle = singleSubs.subscribe('scopeDetail',Router.current().params.scope,Router.current().params._id);
      if(handle.ready()){
        template.ready.set(handle.ready());
      }
    }
  });

});

Template.share.helpers({
  scope () {
    if(Router.current().params.scope){
    const collection = nameToCollection(Router.current().params.scope);
    return collection.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    }
  },
  newsId() {
    return Router.current().params.newsId;
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.shareAdd.onCreated(function () {
  pageSession.set( 'error', false );
});

Template.shareAdd.onRendered(function () {
  pageSession.set( 'error', false );
});

Template.shareAdd.helpers({
  error () {
    return pageSession.get( 'error' );
  }
});


AutoForm.addHooks(['addShare'], {
  after: {
    method : function(error, result) {
      if (!error) {
        console.log('ici');
        let scope = Session.get('scope');
        let scopeId = Session.get('scopeId');
        Router.go('detailList', {_id:scopeId,scope:scope});
      }
    }
  },
  before: {
    method : function(doc, template) {
      //console.log(doc);
      let scope = Session.get('scope');
      let scopeId = Session.get('scopeId');
      let newsId = Session.get('newsId');
      if(scope && scopeId && newsId){
        doc.parentType = 'news';
        doc.parentId = newsId;
      }else{
        doc.parentType = scope;
        doc.parentId = scopeId;
      }
      return doc;
    }
  },
  onError: function(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === "error_call") {
        pageSession.set( 'error', error.reason.replace(": ", ""));
      }
    }
    //let ref;
    //if (error.errorType && error.errorType === 'Meteor.Error') {
      //if ((ref = error.reason) === 'Name must be unique') {
      //this.addStickyValidationError('name', error.reason);
      //AutoForm.validateField(this.formId, 'name');
      //}
    //}
  }
});
