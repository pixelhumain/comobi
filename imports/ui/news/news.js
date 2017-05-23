import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { HTTP } from 'meteor/http';
import { Counts } from 'meteor/tmeasday:publish-counts';
//import { MeteoricCamera } from 'meteor/meteoric:camera';
import { MeteorCameraUI } from 'meteor/aboire:camera-ui';
import { AutoForm } from 'meteor/aldeed:autoform';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

import '../qrcode/qrcode.js'

//submanager
import { newsListSubs,filActusSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { News,SchemasNewsRestBase } from '../../api/news.js';

import { nameToCollection } from '../../api/helpers.js';

import './news.html';

import '../components/directory/list.js';
import '../components/news/button-card.js';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

let pageSession = new ReactiveDict('pageNews');

Session.setDefault('limit', 5);
Session.setDefault('limitFilActus', 5);

Template.newsList.onCreated(function(){
  self = this;
  this.readyScopeDetail = new ReactiveVar();

  this.autorun(function() {
    if(Router.current().route.getName()=="newsList"){
      pageSession.set('selectview', 'scopeNewsTemplate');
    }else if(Router.current().route.getName()=="notificationsList"){
      pageSession.set('selectview', 'scopeNotificationsTemplate');
    }else{
      pageSession.set('selectview', 'scopeDetailTemplate');
    }
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });


this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    this.readyScopeDetail.set(handle.ready());
}.bind(this));

});

Template.newsList.helpers({
  scope () {
    if(Router.current().params.scope){
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    }
  },
  scopeCardTemplate () {
    return  'listCard'+Router.current().params.scope;
  },
  countsousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`);
  },
  issousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`) > 0;
  },
  isVote () {
    return  this.type == "vote";
  },
  dataReadyScopeDetail() {
  return Template.instance().readyScopeDetail.get();
  },
  selectview (){
    return pageSession.get('selectview');
  }
});

Template.scopeDetailTemplate.helpers({
  scopeCardTemplate () {
    return  'listCard'+Router.current().params.scope;
  },
  dataReadyScopeDetail() {
  return Template.instance().readyScopeDetail.get();
  },
});

Template.scopeNewsTemplate.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();

  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    if (!!Session.get('limit')) {
      const handle = newsListSubs.subscribe('newsList', Router.current().params.scope, Router.current().params._id,Session.get('limit'));
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.scopeNewsTemplate.onRendered(function(){
  self = this;
  const showMoreVisible = () => {
    let threshold, target = $("#showMoreResults");
    if (!target.length) return;
    threshold = $('.content.overflow-scroll').scrollTop() + $('.content.overflow-scroll').height();
    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("visible", true);
        Session.set("limit",
        Session.get('limit') + 5);
      }
    } else {
      if (target.data("visible")) {
        target.data("visible", false);
      }
    }
  }

  $('.content.overflow-scroll').scroll(showMoreVisible);

});

Template.scopeNewsTemplate.helpers({
  scopeBoutonNewsTemplate () {
    return  'boutonNews'+Router.current().params.scope;
  },
  isLimit (countNews) {
    return  countNews > Session.get('limit');
  },
  countNews () {
    //console.log(Router.current().params._id)
    return Counts.get(`countNews.${Router.current().params._id}`);
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.scopeFilActusTemplate.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();

  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    if (!!Session.get('limitFilActus')) {
      const handle = filActusSubs.subscribe('citoyenActusList',Session.get('limitFilActus'));
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.scopeFilActusTemplate.onRendered(function(){
  self = this;
  const showMoreVisible = () => {
    let threshold, target = $("#showMoreResultslimitFilActus");
    if (!target.length) return;
    threshold = $('.content.overflow-scroll').scrollTop() + $('.content.overflow-scroll').height();
    if (target.offset().top < threshold) {
      if (!target.data("visiblelimitFilActus")) {
        target.data("visiblelimitFilActus", true);
        Session.set("limitFilActus",
        Session.get('limitFilActus') + 5);
      }
    } else {
      if (target.data("visiblelimitFilActus")) {
        target.data("visiblelimitFilActus", false);
      }
    }
  }

  $('.content.overflow-scroll').scroll(showMoreVisible);

});

Template.scopeFilActusTemplate.helpers({
  scopeBoutonNewsTemplate () {
    return  'boutonFilActus'+Router.current().params.scope;
  },
  isLimit (countNews) {
    return  countNews > Session.get('limitFilActus');
  },
  countNews () {
    //console.log(Router.current().params._id)
    return Counts.get(`countActus.${Router.current().params._id}`);
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});



Template.scopeNotificationsTemplate.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();

  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handleToBeValidated = newsListSubs.subscribe('listMembersToBeValidated', Router.current().params.scope, Router.current().params._id);
      const handle = newsListSubs.subscribe('notificationsScope', Router.current().params.scope, Router.current().params._id);
      if(handleToBeValidated.ready() && handle.ready())
      this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopeNotificationsTemplate.helpers({
  scopeBoutonNotificationsTemplate () {
    return  'boutonNotifications'+Router.current().params.scope;
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.scopeNotificationsTemplate.events({
  'click .validateYes': function(event, template) {
    event.preventDefault();
    const scopeId = Session.get('scopeId');
    const scope = Session.get('scope');
    console.log(`${scopeId},${scope},${this._id._str},${this.scopeVar()}`);
    Meteor.call('validateEntity',scopeId,scope,this._id._str,this.scopeVar(),'toBeValidated', function(err, resp) {
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
    const scopeId = Session.get('scopeId');
    const scope = Session.get('scope');
    Meteor.call('disconnectEntity',scopeId,scope,undefined,this._id._str,this.scopeVar(), function(err, resp) {
      if(err){
        if(err.reason){
          IonPopup.alert({ template: TAPi18n.__(err.reason) });
        }
      }else{
          console.log('no validate');
      }
      });
  }
});

Template.scopeProjectsTemplate.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();

  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
      const handle = newsListSubs.subscribe('directoryListProjects', Router.current().params.scope, Router.current().params._id);
      this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopeProjectsTemplate.helpers({
  scopeBoutonProjectsTemplate () {
    return  'boutonProjects'+Router.current().params.scope;
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.scopeOrganizationsTemplate.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();

  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
      const handle = newsListSubs.subscribe('directoryListOrganizations', Router.current().params.scope, Router.current().params._id);
      this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopeOrganizationsTemplate.helpers({
  scopeBoutonProjectsTemplate () {
    return  'boutonOrganizations'+Router.current().params.scope;
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.scopeEventsTemplate.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();

  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
      const handle = newsListSubs.subscribe('directoryListEvents', Router.current().params.scope, Router.current().params._id);
      this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopeEventsTemplate.helpers({
  scopeBoutonEventsTemplate () {
    return  'boutonProjects'+Router.current().params.scope;
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.listCard.helpers({
  countsousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`);
  },
  issousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`) > 0;
  }
});

Template.actionSheet.events({
  "click .action-card-citoyen" (e, t) {
    const self=this;
    e.preventDefault();
    //info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Citoyens'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'info'});
        }
        if (index === 1) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'network'});
        }
        if (index === 2) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'descriptions'});
        }
        if (index === 3) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'locality'});
        }
        if (index === 4) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'preferences'});
        }
        return true;
      }
    });
  },
  "click .action-card-events" (e, t) {
    const self=this;
    e.preventDefault();
    //info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Events'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit dates')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'info'});
        }
        if (index === 1) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'network'});
        }
        if (index === 2) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'descriptions'});
        }
        if (index === 3) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'locality'});
        }
        if (index === 4) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'when'});
        }
        if (index === 5) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'preferences'});
        }
        return true;
      }
    });
  },
  "click .action-card-organizations" (e, t) {
    const self=this;
    e.preventDefault();
    //info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Organizations'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'info'});
        }
        if (index === 1) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'network'});
        }
        if (index === 2) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'descriptions'});
        }
        if (index === 3) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'locality'});
        }
        if (index === 4) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'preferences'});
        }
        return true;
      }
    });
  },
  "click .action-card-projects" (e, t) {
    const self=this;
    e.preventDefault();
    //info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Projects'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit dates')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'info'});
        }
        if (index === 1) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'network'});
        }
        if (index === 2) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'descriptions'});
        }
        if (index === 3) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'locality'});
        }
        if (index === 4) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'when'});
        }
        if (index === 5) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'preferences'});
        }
        return true;
      }
    });
  },
});


Template.newsList.events({
  "click .selectview" (evt) {
    evt.preventDefault();
    pageSession.set( 'selectview', evt.currentTarget.id);
    return ;
  },
  "click .saveattendees-link" (evt) {
    evt.preventDefault();
    let scopeId=Session.get('scopeId');
    Meteor.call('saveattendeesEvent',scopeId);
    return ;
  },
  "click .inviteattendees-link" (evt) {
    evt.preventDefault();
    let scopeId=Session.get('scopeId');
    Meteor.call('inviteattendeesEvent',scopeId);
    return ;
  },
  "click .connectscope-link" (evt) {
    evt.preventDefault();
    const scopeId=Session.get('scopeId');
    const scope=Session.get('scope');
    Meteor.call('connectEntity',scopeId,scope);
    return ;
  },
  "click .disconnectscope-link" (evt) {
    evt.preventDefault();
    const scopeId=Session.get('scopeId');
    const scope=Session.get('scope');
    Meteor.call('disconnectEntity',scopeId,scope);
    return ;
  },
  "click .followperson-link" (evt) {
    evt.preventDefault();
    const scopeId=Session.get('scopeId');
    const scope=Session.get('scope');
    Meteor.call('followEntity',scopeId,scope);
  return ;
},
"click .unfollowperson-link" (evt) {
  evt.preventDefault();
  const scopeId=Session.get('scopeId');
  const scope=Session.get('scope');
  Meteor.call('disconnectEntity',scopeId,scope);
return ;
},
"click .unfollowscope-link" (evt) {
  evt.preventDefault();
  //parentId:590c5877dd0452330ca1fa1f,parentType:projects,connectType:followers,childId:5534fd9da1aa14201b0041cb,childType:citoyens
  //connectId,parentType,connectType,childId,childType
  const scopeId=Session.get('scopeId');
  const scope=Session.get('scope');
  Meteor.call('disconnectEntity',scopeId,scope,'followers');
return ;
},
  'click .scanner-event' : function(event, template){
    event.preventDefault();
    if(Meteor.isCordova){
      const scopeId=Session.get('scopeId');
      const scope=Session.get('scope');
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if(result.cancelled==false && result.text && result.format=='QR_CODE'){
            let qr = {};
            if (result.text.split('#').length === 2) {
              let urlArray = result.text.split('#')[1].split('.');
              if (urlArray && urlArray.length === 4) {
                qr.type = urlArray[0];
                qr._id = urlArray[3];
              }
            } else {
              qr=JSON.parse(result.text);
            }
            if(qr && qr.type && qr._id){
              if(qr.type === 'person'){
                if(scope === 'events'){
                Meteor.call('saveattendeesEvent', scopeId, undefined, qr._id, function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              } else if(scope === 'organizations'){
                Meteor.call('connectEntity',scopeId,'organizations',qr._id, function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              } else if(scope === 'projects'){
                Meteor.call('connectEntity',scopeId,'projects',qr._id, function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              }
            }
            }
          }else{
            return ;
          }
        },
        function (error) {
          alert("Scanning failed: " + error);
          return ;
        }
      );
    }
    return ;
  },
  "click .give-me-more" (evt) {
    let newLimit = Session.get('limit') + 10;
    Session.set('limit', newLimit);
  },
  "click .photo-link-new" (event, template) {
    var self = this;
    let scopeId=Session.get('scopeId');
    let scope=Session.get('scope');
    let options = {
      width: 640,
      height: 480,
      quality: 75
    };

function successCallback (retour){
  const newsId = retour;
  IonPopup.confirm({title:TAPi18n.__('Photo'),template:TAPi18n.__('Voulez vous ajouter une autre photo à cette news ?'),
  onOk: function(){
    MeteorCameraUI.getPicture(options,function (error, data) {
      if (! error) {
        let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
        Meteor.call("photoNews",data,str,scope,self._id._str,newsId, function (error, result) {
          if (!error) {
            successCallback(result.newsId);
          }else{
            //console.log('error',error);
          }
        });
      }});
    },
    onCancel: function(){
      Router.go('detailList', {_id:self._id._str,scope:scope});
    }
  });
}

    MeteorCameraUI.getPicture(options,function (error, data) {
      if (! error) {
        let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
        Meteor.call("photoNews",data,str,scope,self._id._str, function (error, result) {
          if (!error) {
            successCallback(result.newsId);
          }else{
            //console.log('error',error);
          }
        });
      }});

    },
    "click .photo-link-scope" (event, template) {
      event.preventDefault();
      const self = this;
      const scopeId = Session.get('scopeId');
      const scope = Session.get('scope');
      const options = {
        width: 640,
        height: 480,
        quality: 75
      };
      MeteorCameraUI.getPicture(options,function (error, data) {
        if (! error) {
          let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
          let dataURI = data;
          Meteor.call("photoScope",scope,data,str,self._id._str, function (error, result) {
            if (!error) {
              console.log(result);
            }else{
              //console.log('error',error);
            }
          });
        }});

      }
    });

    Template.newsAdd.onCreated(function () {
      const self = this;
      self.ready = new ReactiveVar();
      pageSession.set( 'error', false );

      self.autorun(function(c) {
          Session.set('scopeId', Router.current().params._id);
          Session.set('scope', Router.current().params.scope);
      });

      self.autorun(function(c) {
          const handle = Meteor.subscribe('scopeDetail',Router.current().params.scope,Router.current().params._id);
          if(handle.ready()){
            self.ready.set(handle.ready());
          }
      });


    });

    Template.newsAdd.onRendered(function () {
        const self = this;
        pageSession.set( 'error', false );
        pageSession.set( 'queryMention', false );
        pageSession.set( 'queryTag', false );
        pageSession.set( 'mentions', false );
        pageSession.set( 'tags', false );
        self.$('textarea').atwho({
          at: "@",
          limit: 10,
          delay: 600,
          displayTimeout: 300,
          startWithSpace: false,
          displayTpl: function(item) {
            return `<li><img src='${item.avatar}' height='20' width='20'/> ${item.name} ${item.id} </li>`;
          },
          searchKey: "name"
        }).atwho({
          at: "#"
        }).on("matched.atwho", function(event, flag, query) {
            console.log(event, "matched " + flag + " and the result is " + query);
            if(flag === '@' && query){
            console.log(pageSession.get('queryMention'));
            if(pageSession.get( 'queryMention') !== query){
              pageSession.set( 'queryMention', query);
              Meteor.call('searchMemberautocomplete',query, function(error,result) {
              if (!error) {
                const citoyensArray = _.map(result.citoyens, (array,key) => {
                  return {id:key,name:array.name,type:'citoyens',avatar:`${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}`};
                });
                const organizationsArray = _.map(result.organizations, (array,key) => {
                  return {id:key,name:array.name,type:'organizations',avatar:`${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}`};
                });
                const arrayUnions = _.union(citoyensArray,organizationsArray)
                console.log(citoyensArray);
                self.$('textarea').atwho('load', '@', arrayUnions).atwho('run');
              }
            });
            }
          } else if(flag === '#' && query){
          console.log(pageSession.get('queryTag'));
          if(pageSession.get( 'queryTag') !== query){
            pageSession.set( 'queryTag', query);
            Meteor.call('searchTagautocomplete',query, function(error,result) {
            if (!error) {
              console.log(result);
              self.$('textarea').atwho('load', '#', result).atwho('run');
            }
          });
          }
        }
          }).on("inserted.atwho", function(event, $li, browser) {
              console.log(JSON.stringify($li.data('item-data')));

              if($li.data('item-data')['atwho-at'] == '@'){
              const mentions = {};
              //const arrayMentions = [];
              mentions['name'] = $li.data('item-data').name;
              mentions['id'] = $li.data('item-data').id;
              mentions['type'] = $li.data('item-data').type;
              mentions['avatar'] = $li.data('item-data').avatar;
              mentions['value'] = $li.data('item-data').name;
              if(pageSession.get('mentions')){
                let arrayMentions = pageSession.get('mentions');
                arrayMentions.push(mentions);
                pageSession.set( 'mentions', arrayMentions);
              }else{
                pageSession.set( 'mentions', [mentions] );
              }
            }else if($li.data('item-data')['atwho-at'] == '#'){
              const tag = $li.data('item-data').name;
              if(pageSession.get('tags')){
                let arrayTags = pageSession.get('tags');
                arrayTags.push(tag);
                pageSession.set( 'tags', arrayTags);
              }else{
                pageSession.set( 'tags', [tag] );
              }
            }
            });
    });

Template.newsAdd.onDestroyed(function () {
this.$('textarea').atwho('destroy');
});

    Template.newsAdd.helpers({
      scope () {
        if(Router.current().params.scope){
          const collection = nameToCollection(Router.current().params.scope);
          return collection.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
        }
      },
      error () {
        return pageSession.get( 'error' );
      },
      blockSchema() {
        return Router.current().params.scope && SchemasNewsRestBase[Router.current().params.scope];
      },
      dataReady() {
      return Template.instance().ready.get();
      }
    });

    Template.newsEdit.onCreated(function () {
      const self = this;
      self.ready = new ReactiveVar();
      pageSession.set( 'error', false );

      self.autorun(function(c) {
          Session.set('scopeId', Router.current().params._id);
          Session.set('scope', Router.current().params.scope);
      });

      self.autorun(function(c) {
          const handle = Meteor.subscribe('scopeDetail',Router.current().params.scope,Router.current().params._id);
          const handleScopeDetail = Meteor.subscribe('newsDetail', Router.current().params.scope,Router.current().params._id,Router.current().params.newsId);
          if(handle.ready() && handleScopeDetail.ready()){
            self.ready.set(handle.ready());
          }
      });

    });

    Template.newsEdit.onRendered(function () {
      const self = this;
      pageSession.set( 'error', false );
      pageSession.set( 'queryMention', false );
      pageSession.set( 'queryTag', false );
      pageSession.set( 'mentions', false );
      pageSession.set( 'tags', false );
    });

    Template.newsFields.onRendered(function () {
      const self = this;
      self.$('textarea').atwho({
        at: "@",
        limit: 10,
        delay: 600,
        displayTimeout: 300,
        startWithSpace: false,
        displayTpl: function(item) {
          return `<li><img src='${item.avatar}' height='20' width='20'/> ${item.name} ${item.id} </li>`;
        },
        searchKey: "name"
      }).atwho({
        at: "#"
      }).on("matched.atwho", function(event, flag, query) {
          console.log(event, "matched " + flag + " and the result is " + query);
          if(flag === '@' && query){
          console.log(pageSession.get('queryMention'));
          if(pageSession.get( 'queryMention') !== query){
            pageSession.set( 'queryMention', query);
            Meteor.call('searchMemberautocomplete',query, function(error,result) {
            if (!error) {
              const citoyensArray = _.map(result.citoyens, (array,key) => {
                return {id:key,name:array.name,type:'citoyens',avatar:`${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}`};
              });
              const organizationsArray = _.map(result.organizations, (array,key) => {
                return {id:key,name:array.name,type:'organizations',avatar:`${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}`};
              });
              const arrayUnions = _.union(citoyensArray,organizationsArray)
              console.log(citoyensArray);
              self.$('textarea').atwho('load', '@', arrayUnions).atwho('run');
            }
          });
          }
        } else if(flag === '#' && query){
        console.log(pageSession.get('queryTag'));
        if(pageSession.get( 'queryTag') !== query){
          pageSession.set( 'queryTag', query);
          Meteor.call('searchTagautocomplete',query, function(error,result) {
          if (!error) {
            console.log(result);
            self.$('textarea').atwho('load', '#', result).atwho('run');
          }
        });
        }
      }
        }).on("inserted.atwho", function(event, $li, browser) {
            console.log(JSON.stringify($li.data('item-data')));

            if($li.data('item-data')['atwho-at'] == '@'){
            const mentions = {};
            //const arrayMentions = [];
            mentions['name'] = $li.data('item-data').name;
            mentions['id'] = $li.data('item-data').id;
            mentions['type'] = $li.data('item-data').type;
            mentions['avatar'] = $li.data('item-data').avatar;
            mentions['value'] = $li.data('item-data').name;
            if(pageSession.get('mentions')){
              let arrayMentions = pageSession.get('mentions');
              arrayMentions.push(mentions);
              pageSession.set( 'mentions', arrayMentions);
            }else{
              pageSession.set( 'mentions', [mentions] );
            }
          }else if($li.data('item-data')['atwho-at'] == '#'){
            const tag = $li.data('item-data').name;
            if(pageSession.get('tags')){
              let arrayTags = pageSession.get('tags');
              arrayTags.push(tag);
              pageSession.set( 'tags', arrayTags);
            }else{
              pageSession.set( 'tags', [tag] );
            }
          }
          });
    });

    Template.newsFields.onDestroyed(function () {
    this.$('textarea').atwho('destroy');
    });

    Template.newsEdit.helpers({
      new () {
        let news = News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
        let newEdit = {};
        newEdit._id = news._id._str;
        if(news && news.mentions){
          pageSession.set( 'mentions', news.mentions);
        }
        if(news && news.tags){
          pageSession.set( 'tags', news.tags);
        }
        newEdit.text = news.text;
        return newEdit;
      },
      blockSchema() {
        return Router.current().params.scope && SchemasNewsRestBase[Router.current().params.scope];
      },
      error () {
        return pageSession.get( 'error' );
      },
      dataReady() {
      return Template.instance().ready.get();
      },
      blockSchema() {
      return Router.current().params.scope && SchemasNewsRestBase[Router.current().params.scope];
      }
    });

    AutoForm.addHooks(['addNew', 'editNew'], {
      after: {
        method : function(error, result) {
          if (!error) {
            var self = this;
            let selfresult=result.data.id["$id"];
            let scopeId=Session.get('scopeId');
            let scope=Session.get('scope');

            let options = {
              width: 640,
              height: 480,
              quality: 75
            };

            function successCallback (retour){
              const newsId = retour;
              IonPopup.confirm({title:TAPi18n.__('Photo'),template:TAPi18n.__('Voulez vous ajouter une autre photo à cette news ?'),
              onOk: function(){
                MeteorCameraUI.getPicture(options,function (error, data) {
                  if (! error) {
                    let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
                    Meteor.call("photoNews",data,str,scope,scopeId,newsId, function (error, result) {
                      if (!error) {
                        successCallback(result.newsId);
                      }else{
                        //console.log('error',error);
                      }
                    });
                  }});
                },
                onCancel: function(){
                  Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
                }
              });
            }

            IonPopup.confirm({title:TAPi18n.__('Photo'),template:TAPi18n.__('Voulez vous prendre une photo ?'),
            onOk: function(){
              MeteorCameraUI.getPicture(options,function (error, data) {
                if (! error) {
                  let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
                  Meteor.call("photoNews",data,str,scope,scopeId,selfresult, function (error, photoret) {
                    if (!error) {
                      successCallback(photoret.newsId);
                    }else{
                      //console.log('error',error);
                    }
                  });
                }});
              },
              onCancel: function(){

              }
            });

            //Meteor.call('pushNewNewsAttendees',scopeId,selfresult);
            Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
          }
        },
        "method-update" : function(error, result) {
          if (!error) {
            Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
          }
        }
      },
      before: {
        method : function(doc, template) {
          //console.log(doc);
          let scope = Session.get('scope');
          let scopeId = Session.get('scopeId');
          doc.parentType = scope;
          doc.parentId = scopeId;
          //comparer dans le text si @name present dans le array

          if(pageSession.get('mentions')){
            const arrayMentions = _.reject(pageSession.get('mentions'), (array) => {
              return doc.text.match(`@${array.value}`) === null;
            }, doc.text);
            doc.mentions = arrayMentions;
          }else{
            //si on update est ce que la mention reste

          }
          const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
          const matches = [];
          let match;
          while ((match = regex.exec(doc.text))) {
            matches.push(match[1]);
          }
          if(pageSession.get('tags')){
            const arrayTags = _.reject(pageSession.get('tags'), (value) => {
              return doc.text.match(`#${value}`) === null;
            }, doc.text);
            if(doc.tags){
              doc.tags = _.uniq(_.union(doc.tags,arrayTags,matches));
            }else{
              doc.tags = _.uniq(_.union(arrayTags,matches));
            }
          }else{
            //si on update est ce que la mention reste
            if(matches.length > 0){
            if(doc.tags){
              doc.tags = _.uniq(_.union(doc.tags,matches));
            }else{
              doc.tags = _.uniq(matches);
            }
          }
          }
          return doc;
        },
        "method-update" : function(modifier, documentId) {
          let scope = Session.get('scope');
          let scopeId = Session.get('scopeId');
          modifier["$set"].parentType = scope;
          modifier["$set"].parentId = scopeId;
          if(pageSession.get('mentions')){
            const arrayMentions = _.reject(pageSession.get('mentions'), (array) => {
              return modifier["$set"].text.match(`@${array.value}`) === null;
            }, modifier["$set"].text);
            modifier["$set"].mentions = arrayMentions;
          }else{
            //si on update est ce que la mention reste

          }

          const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
          const matches = [];
          let match;
          while ((match = regex.exec(modifier["$set"].text))) {
            matches.push(match[1]);
          }
          if(pageSession.get('tags')){
            const arrayTags = _.reject(pageSession.get('tags'), (value) => {
              return modifier["$set"].text.match(`#${value}`) === null;
            }, modifier["$set"].text);
            if(modifier["$set"].tags){
              modifier["$set"].tags = _.uniq(_.union(modifier["$set"].tags,arrayTags,matches));
            }else{
              modifier["$set"].tags = _.uniq(_.union(arrayTags,matches));
            }
          }else{
            //si on update est ce que la mention reste
            if(matches.length > 0){
            if(doc.modifier["$set"]){
              doc.modifier["$set"] = _.uniq(_.union(doc.modifier["$set"],matches));
            }else{
              doc.modifier["$set"] = _.uniq(matches);
            }
          }
          }
          return modifier;
        }
      },
      onError: function(formType, error) {
        if (error.errorType && error.errorType === 'Meteor.Error') {
          if (error && error.error === "error_call") {
            pageSession.set( 'error', error.reason.replace(":", " "));
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

    Template._inviteattendeesEvent.onCreated(function () {
      pageSession.set( 'error', false );
      pageSession.set( 'invitedUserEmail', false);
    });

    Template._inviteattendeesEvent.onRendered(function () {
      pageSession.set( 'error', false );
      pageSession.set( 'invitedUserEmail', false);
    });

    Template._inviteattendeesEvent.helpers({
      error () {
        return pageSession.get( 'error' );
      }
    });

    AutoForm.addHooks(['inviteAttendeesEvent'], {
      before: {
        method : function(doc, template) {
          let scopeId = Session.get('scopeId');
          doc.eventId = scopeId;
          pageSession.set( 'invitedUserEmail', doc.invitedUserEmail);
          return doc;
        }
      },
      after: {
        method : function(error, result) {
          if (!error) {
            IonModal.close();
          }
        }
      },
      onError: function(formType, error) {
        //console.log(error);
        if (error.errorType && error.errorType === 'Meteor.Error') {
          if (error && error.error === "error_call") {
            if( error.reason == "Problème à l'insertion du nouvel utilisateur : une personne avec cet mail existe déjà sur la plateforme"){
              Meteor.call('saveattendeesEvent',Session.get('scopeId'),pageSession.get( 'invitedUserEmail'),function(error,result){
                if(error){
                  pageSession.set( 'error', error.reason.replace(":", " "));
                }else{
                  IonModal.close();
                }
              });
            }
          }else{
            pageSession.set( 'error', error.reason.replace(":", " "));
          }
        }
      }
    });
