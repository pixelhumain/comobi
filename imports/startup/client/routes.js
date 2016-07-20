import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { SubsManager } from 'meteor/meteorhacks:subs-manager'

Router.configure({
  layoutTemplate: "layout",
  loadingTemplate: "loading"
});

var singleSubs = new SubsManager();

Router.map(function() {

  this.route('camera-page');

  this.route("login", {
    path: '/login'
  });

  this.route("signin", {
    path: '/signin'
  });

  this.route('signOut', {
    path: '/sign-out',
    layoutTemplate: "layout",
    onBeforeAction: function() {
      Meteor.logout();
      //console.log('logout');
      this.next();
      //Router.go('/');
    }
  });

  this.route("listEvents", {
    path: '/',
    template: "listEvents",
    loadingTemplate: 'loading',
    /*waitOn: function() {
      Meteor.subscribe('citoyen');
      let geo = Location.getReactivePosition();
      let radius = Session.get('radius');
      if(radius && geo && geo.latitude){
        let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
        singleSubs.subscribe('citoyenEvents',latlng,radius);
      }else{
        //console.log('City');
        let city = Session.get('city');
        if(city && city.geoShape && city.geoShape.coordinates){
          singleSubs.subscribe('citoyenEvents',city.geoShape.coordinates);
        }
      }
    }*/
  });

  this.route("mapEvents", {
    path: '/mapevents',
    template: "mapEvents",
    loadingTemplate: 'loading',
    /*waitOn: function() {
      Meteor.subscribe('citoyen');
      let geo = Location.getReactivePosition();
      let radius = Session.get('radius');
      if(radius && geo && geo.latitude){
        let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
        Meteor.subscribe('citoyenEvents',latlng,radius);
      }else{
        //console.log('City');
        let city = Session.get('city');
        if(city && city.geoShape && city.geoShape.coordinates){
          Meteor.subscribe('citoyenEvents',city.geoShape.coordinates);
        }
      }
    }*/
  });

  this.route("mapWithEvent", {
    template: "mapEvents",
    loadingTemplate: 'loading',
    path: 'mapevents/:_id',
    /*waitOn: function() {
      Meteor.subscribe('citoyen');
      let geo = Location.getReactivePosition();
      let radius = Session.get('radius');
      if(geo && geo.latitude){
        let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
        Meteor.subscribe('citoyenEvents',latlng,radius);
      }
    },*/
    data: function() {
      Session.set("currentEvent", this.params._id);
    }
  });

  this.route("eventsAdd", {
    template: "eventsAdd",
    path: 'events/add',
    data: function() {
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('lists');
    }
  });

  this.route("eventsEdit", {
    template: "eventsEdit",
    path: 'events/:_id/edit',
    data: function() {
      return null;
    },
    waitOn: function() {
      return [ Meteor.subscribe('lists') , Meteor.subscribe('scopeDetail','events',this.params._id) ];
    }
  });

  this.route("newsList", {
    template: "newsList",
    path: ':scope/news/:_id',
    loadingTemplate: 'loading',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      return Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
    }
  });

  this.route("listAttendees", {
    template: "listAttendees",
    path: 'events/attendees/:_id',
    loadingTemplate: 'loading',
    data: function() {
      Session.set('scopeId', this.params._id);
      return null;
    },
    waitOn: function() {
      return Meteor.subscribe('listAttendees', this.params._id);
    }
  });


  this.route("newsDetail", {
    template: "newsDetail",
    path: ':scope/news/:_id/new/:newsId',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
      return singleSubs.subscribe('newsDetail', this.params.newsId);
    }
  });

  this.route("newsAdd", {
    template: "newsAdd",
    path: ':scope/news/:_id/add',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
    }
  });

  this.route("newsEdit", {
    template: "newsEdit",
    path: ':scope/news/:_id/edit/:newsId',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
      return Meteor.subscribe('newsDetail', this.params.newsId);
    }
  });

  this.route('settings', {
    template: "settings",
    path: '/settings',
  });


  this.route('contacts', {
    template: "contacts",
    path: '/contacts'
  });

  this.route('chatui', {
    template: "chatui",
    layoutTemplate:'layoutChatui',
    path: '/chatui',
    data: function() {
          Session.set('hasTabs', false);
          Session.set('hasTabsTop', false);
      return null;
    }
  });

  this.route('changePosition', {
    template: "changePosition",
    path: '/cities'
  });



  this.route('notifications', {
    template: "notifications",
    path: '/notifications',
    data: function() {
      return null;
    },
    waitOn: function() {
      return singleSubs.subscribe('notificationsUser');
    }
  });

});


let ensurePixelSignin = function () {
  if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.pixelhumain) {
    this.next();
  } else {
    this.render('login');
  }
};

Router.onBeforeAction(ensurePixelSignin, {except: ['login','signin']});
