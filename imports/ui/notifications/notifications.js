import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import { ActivityStream } from '../../api/activitystream.js';

//submanager
import { singleSubs} from '../../api/client/subsmanager.js';

import './notifications.html';

Template.notifications.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function(c) {
      const handle = singleSubs.subscribe('notificationsUser');
        self.ready.set(handle.ready());
  });

});

Template.notifications.helpers({
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.notifications.helpers({
  notifications () {
    return ActivityStream.api.isUnread();
  }
});

Template.notificationsList.events({
  'click .validateYes': function(event, template) {
    event.preventDefault();
    console.log(`${this.target.id},${this.target.type},${this.authorId()}`);
    Meteor.call('validateEntity',this.target.id,this.target.type,this.authorId(),'citoyens','toBeValidated', function(err, resp) {
      if(err){
        if(err.reason){
          IonPopup.alert({ template: TAPi18n.__(err.reason) });
        }
      }else{
          console.log('yes validate');
      }
      });
  },
  'click .validateNo': function(event, template) {
    event.preventDefault();
    console.log(this._id._str);
    Meteor.call('disconnectEntity',this.target.id,this.target.type,undefined,this.authorId(),'citoyens', function(err, resp) {
      if(err){
        if(err.reason){
          IonPopup.alert({ template: TAPi18n.__(err.reason) });
        }
      }else{
          console.log('no validate');
      }
      });
  },
    'click .removeMe': function(event, template) {
      event.preventDefault();
      console.log(this._id._str);
      Meteor.call('markRead', this._id._str, function(err, resp) {
            console.log('mark as read response', resp)
        });
    },
    'click .clickGo': function(event, template) {
      event.preventDefault();
      console.log(this._id._str);
        Meteor.call('markSeen', this._id._str);

        const VERB_VIEW = "view";
        const VERB_ADD = "add";
        const VERB_UPDATE = "update";
        const VERB_CREATE = "create";
        const VERB_DELETE = "delete";

        const VERB_JOIN = "join";
        const VERB_WAIT = "wait";
        const VERB_LEAVE = "leave";
        const VERB_INVITE = "invite";
        const VERB_ACCEPT = "accept";
        const VERB_CLOSE = "close";
        const VERB_SIGNIN = "signin";

        const VERB_HOST = "host";
        const VERB_FOLLOW = "follow";
        const VERB_CONFIRM = "confirm";
        const VERB_AUTHORIZE = "authorize";
        const VERB_ATTEND = "attend";
        const VERB_COMMENT = "comment";
        const VERB_MENTION = "mention";
        const VERB_ADDROOM = "addactionroom";
        const VERB_ADD_PROPOSAL = "addproposal";
        const VERB_MODERATE = "moderate";
        const VERB_ADD_ACTION = "addaction";
        const VERB_VOTE = "vote";

        const VERB_POST = "post";
        const VERB_RETURN = "return";


        if(this.verb === 'comment'){
            if(this.target.type === 'news'){
              Router.go('newsDetailComments', {_id:this.target.parent.id,newsId:this.target.id,scope:this.target.parent.type});
            }
        }else if(this.verb === 'like'){
          if(this.target.type === 'news'){
            Router.go('newsDetailComments', {_id:this.target.parent.id,newsId:this.target.id,scope:this.target.parent.type});
          }
        }else if(this.verb === 'post'){
          if(this.target.type === 'citoyens' || this.target.type === 'projects' || this.target.type === 'organizations' || this.target.type === 'events'){
            if(this.notify.objectType === 'news'){
              Router.go('newsList', {_id:this.target.id,scope:this.target.type});
            }
          }
        }else if(this.verb === 'join' || this.verb === 'ask'){
          if(this.target.type === 'citoyens' || this.target.type === 'projects' || this.target.type === 'organizations' || this.target.type === 'events'){
            if(this.notify.objectType === 'asMember'){
              Router.go('detailList', {_id:this.target.id,scope:this.target.type});
            }
          }
        }else if(this.verb === 'accept'){
          if(this.object.objectType === 'citoyens' || this.object.objectType === 'projects' || this.object.objectType === 'organizations' || this.object.objectType === 'events'){
            if(this.target.objectType === 'projects' || this.target.objectType === 'organizations' || this.target.objectType === 'events'){
              Router.go('detailList', {_id:this.target.id,scope:this.target.objectType});

            }
          }
        }

    }
})
