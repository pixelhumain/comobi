import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { Counts } from 'meteor/tmeasday:publish-counts';

export const ActivityStream = new Meteor.Collection("activityStream", {idGeneration : 'MONGO'});


ActivityStream.api = {
  Unseen (userId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (Counts.has(`notifications.${bothUserId}.Unseen`)) {
      return Counts.get(`notifications.${bothUserId}.Unseen`);
    }
  },
  UnseenAsk (userId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (Counts.has(`notifications.${bothUserId}.UnseenAsk`)) {
      return Counts.get(`notifications.${bothUserId}.UnseenAsk`);
    }
  },
  Unread (userId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (Counts.has(`notifications.${bothUserId}.Unread`)) {
      return Counts.get(`notifications.${bothUserId}.Unread`);
    }
  },
  queryUnseen (userId,scopeId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    let bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const queryUnseen = {};
    queryUnseen[`notify.id.${bothUserId}`] = {$exists:1};
    queryUnseen[`notify.id.${bothUserId}.isUnseen`] = true;
    if(bothScopeId){
      queryUnseen[`target.id`] = bothScopeId;
    }
    return ActivityStream.find(queryUnseen,{fields:{_id:1}});
  },
  queryUnseenAsk (userId,scopeId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    let bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const queryUnseen = {};
    queryUnseen[`notify.id.${bothUserId}`] = {$exists:1};
    queryUnseen[`notify.id.${bothUserId}.isUnseen`] = true;
    if(bothScopeId){
      queryUnseen[`target.id`] = bothScopeId;
      queryUnseen[`verb`] = {$in:['ask']};
    }
    return ActivityStream.find(queryUnseen,{fields:{_id:1}});
  },
  queryUnread (userId,scopeId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    let bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const queryUnread = {};
  	queryUnread[`notify.id.${bothUserId}`] = {$exists:1};
  	queryUnread[`notify.id.${bothUserId}.isUnread`] = true;
    if(bothScopeId){
      queryUnread[`target.id`] = bothScopeId;
    }
    return ActivityStream.find(queryUnread,{fields:{_id:1}});
  },
  isUnread (userId,scopeId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    let bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const query = {};
    query[`notify.id.${bothUserId}`] = {$exists:1};
    if(bothScopeId){
      query[`verb`] = {$nin:['ask']};
      query[`target.id`] = bothScopeId;
    }else{
      query[`notify.id.${bothUserId}.isUnread`] = true;
    }
    const options = {};
    options['sort'] = {'created': -1};
    options['fields'] = {}
    options['fields'][`notify.id.${bothUserId}.isUnread`] = 1;
    options['fields'][`notify.id.${bothUserId}.isUnseen`] = 1;
    options['fields']['notify.displayName'] = 1;
    options['fields']['notify.icon'] = 1;
    options['fields']['notify.url'] = 1;
    options['fields']['notify.objectType'] = 1;
    options['fields']['verb'] = 1;
    options['fields']['target'] = 1;
    options['fields']['created'] = 1;
    options['fields']['author'] = 1;
    options['fields']['type'] = 1;
    return ActivityStream.find(query,options);
  },
  isUnseen (userId,scopeId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    let bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const query = {};
    query[`notify.id.${bothUserId}`] = {$exists:1};
    if(bothScopeId){
      query[`target.id`] = bothScopeId;
    }else{
      query[`notify.id.${bothUserId}.isUnseen`] = true;
    }
    const options = {};
    options['sort'] = {'created': -1};
    /*options['fields'] = {}
    options['fields'][`notify.id.${bothUserId}`] = 1;
    options['fields']['notify.displayName'] = 1;
    options['fields']['notify.icon'] = 1;
    options['fields']['notify.url'] = 1;
    options['fields']['notify.objectType'] = 1;
    options['fields']['verb'] = 1;
    options['fields']['target'] = 1;
    options['fields']['created'] = 1;
    options['fields']['author'] = 1;
    options['fields']['type'] = 1;*/
    return ActivityStream.find(query,options);
  },
  isUnseenAsk (userId,scopeId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    let bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const query = {};
    query[`verb`] = {$in:['ask']};
    query[`notify.id.${bothUserId}`] = {$exists:1};
    if(bothScopeId){
      query[`target.id`] = bothScopeId;
    }else{
      query[`notify.id.${bothUserId}.isUnseen`] = true;
    }
    const options = {};
    options['sort'] = {'created': -1};
    /*options['fields'] = {}
    options['fields'][`notify.id.${bothUserId}`] = 1;
    options['fields']['notify.displayName'] = 1;
    options['fields']['notify.icon'] = 1;
    options['fields']['notify.url'] = 1;
    options['fields']['notify.objectType'] = 1;
    options['fields']['verb'] = 1;
    options['fields']['target'] = 1;
    options['fields']['created'] = 1;
    options['fields']['author'] = 1;
    options['fields']['type'] = 1;*/
    return ActivityStream.find(query,options);
  },
  isUnreadAsk (userId,scopeId) {
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    let bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const query = {};
    query[`verb`] = {$in:['ask']};
    query[`notify.id.${bothUserId}`] = {$exists:1};
    if(bothScopeId){
      query[`target.id`] = bothScopeId;
    }else{
      query[`notify.id.${bothUserId}.isUnread`] = true;
    }
    const options = {};
    options['sort'] = {'created': -1};
    options['fields'] = {}
    options['fields'][`notify.id.${bothUserId}`] = 1;
    options['fields']['notify.displayName'] = 1;
    options['fields']['notify.icon'] = 1;
    options['fields']['notify.url'] = 1;
    options['fields']['notify.objectType'] = 1;
    options['fields']['verb'] = 1;
    options['fields']['target'] = 1;
    options['fields']['created'] = 1;
    options['fields']['author'] = 1;
    options['fields']['type'] = 1;
    return ActivityStream.find(query,options);
  }
};

ActivityStream.helpers({
  authorId () {
    const keyArray = _.map(this.author, (a,k) => {
      return k;
    });
    return keyArray[0];
  }
});

/*{
"_id" : ObjectId("58a06ec0e2f07e27233ba05e"),
"type" : "notifications",
"verb" : "comment",
"author" : {
"586f6493e2f07ea55a8b456c" : {
"name" : "pikachui"
}
},
"date" : ISODate("2017-02-12T14:18:40.000Z"),
"created" : ISODate("2017-02-12T14:18:40.000Z"),
"object" : {
"id" : "58a06149e2f07e3b243ba040",
"type" : "comments"
},
"target" : {
"type" : "news",
"id" : "58a060e0e2f07e69233ba03a"
},
"notify" : {
"objectType" : "comments",
"id" : {
"586f6493e2f07ea55a8b456b" : {}
},
"displayName" : "pikachui a répondu à votre commentaire posté sur votre post",
"icon" : "fa-comment",
"url" : "news/detail/id/58a060e0e2f07e69233ba03a"
}
}*/
