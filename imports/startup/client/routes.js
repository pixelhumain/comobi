import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { SubsManager } from 'meteor/meteorhacks:subs-manager'

Router.configure({
  layoutTemplate: "layout",
  loadingTemplate: "loading"
});


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

  this.route("dashboard", {
    path: '/',
    template: "dashboard",
    loadingTemplate: 'loading',
  });

  this.route("dashboardRedirect", {
    path: '/dashboard',
    template: "dashboard",
    loadingTemplate: 'loading',
  });

  this.route("listEvents", {
    path: '/events',
    template: "listEvents",
    loadingTemplate: 'loading'
  });

  this.route("listOrganizations", {
    path: '/organizations',
    template: "listOrganizations",
    loadingTemplate: 'loading'
  });

  this.route("listProjects", {
    path: '/projects',
    template: "listProjects",
    loadingTemplate: 'loading'
  });

  this.route("listCitoyens", {
    path: '/citoyens',
    template: "listCitoyens",
    loadingTemplate: 'loading'
  });

  this.route("organizationsAdd", {
    template: "organizationsAdd",
    path: '/organizations/add',
    loadingTemplate: 'loading'
  });

  this.route("citoyensBlockEdit", {
    template: "citoyensBlockEdit",
    path: '/citoyens/:_id/edit/block/:block',
    loadingTemplate: 'loading'
  });

  this.route("eventsBlockEdit", {
    template: "eventsBlockEdit",
    path: '/events/:_id/edit/block/:block',
    loadingTemplate: 'loading'
  });

  this.route("organizationsBlockEdit", {
    template: "organizationsBlockEdit",
    path: '/organizations/:_id/edit/block/:block',
    loadingTemplate: 'loading'
  });

  this.route("projectsBlockEdit", {
    template: "projectsBlockEdit",
    path: '/projects/:_id/edit/block/:block',
    loadingTemplate: 'loading'
  });

  this.route("citoyensEdit", {
    template: "citoyensEdit",
    path: '/citoyens/:_id/edit',
    loadingTemplate: 'loading'
  });

  this.route("organizationsEdit", {
    template: "organizationsEdit",
    path: '/organizations/:_id/edit',
    loadingTemplate: 'loading'
  });

  /*this.route("projectsAdd", {
    template: "projectsAdd",
    path: 'projects/add',
    loadingTemplate: 'loading'
  });*/

  this.route("projectsAdd", {
    template: "projectsAdd",
    path: '/:scope/projects/:_id/add',
    loadingTemplate: 'loading'
  });

  this.route("projectsEdit", {
    template: "projectsEdit",
    path: '/projects/:_id/edit',
    loadingTemplate: 'loading'
  });

  this.route("map", {
    path: '/map/:scope/',
    template: "mapScope",
    loadingTemplate: 'loading'
  });

  this.route("mapWith", {
    template: "mapScope",
    loadingTemplate: 'loading',
    path: '/map/:scope/:_id'
  });

  /*this.route("eventsAdd", {
    template: "eventsAdd",
    path: 'events/add',
    loadingTemplate: 'loading'
  });*/

  this.route("eventsAdd", {
    template: "eventsAdd",
    path: '/:scope/events/:_id/add',
    loadingTemplate: 'loading'
  });

  this.route("eventsEdit", {
    template: "eventsEdit",
    path: '/events/:_id/edit',
    loadingTemplate: 'loading'
  });

  this.route("detailList", {
    template: "newsList",
    path: '/:scope/detail/:_id',
    loadingTemplate: 'loading'
  });

  this.route("share", {
    template: "share",
    path: '/:scope/share/:_id/:newsId?',
    loadingTemplate: 'loading'
  });

  this.route("newsList", {
    template: "newsList",
    path: '/:scope/news/:_id',
    loadingTemplate: 'loading'
  });

  this.route("actusList", {
    template: "newsList",
    path: '/:scope/actus/:_id',
    loadingTemplate: 'loading'
  });

  this.route("notificationsList", {
    template: "newsList",
    path: '/:scope/notifications/:_id',
    loadingTemplate: 'loading'
  });

  this.route("organizationsList", {
    template: "newsList",
    path: '/:scope/organizations/:_id',
    loadingTemplate: 'loading'
  });

  this.route("projectsList", {
    template: "newsList",
    path: '/:scope/projects/:_id',
    loadingTemplate: 'loading'
  });

  this.route("eventsList", {
    template: "newsList",
    path: '/:scope/events/:_id',
    loadingTemplate: 'loading'
  });

  this.route("directory", {
    template: "directory",
    path: '/:scope/directory/:_id',
    loadingTemplate: 'loading'
  });

  this.route("listeventSous", {
    template: "listeventSous",
    path: '/events/sous/:_id',
    loadingTemplate: 'loading'
  });

  this.route("listMembers", {
    template: "listMembers",
    path: '/organizations/members/:_id',
    loadingTemplate: 'loading'
  });

  this.route("listContributors", {
    template: "listContributors",
    path: '/projects/contributors/:_id',
    loadingTemplate: 'loading'
  });

  this.route("listAttendees", {
    template: "listAttendees",
    path: '/events/attendees/:_id',
    loadingTemplate: 'loading'
  });

  this.route("listFollows", {
    template: "listFollows",
    path: '/citoyens/follows/:_id',
    loadingTemplate: 'loading'
  });

  this.route("newsDetail", {
    template: "newsDetail",
    path: '/:scope/news/:_id/new/:newsId'
  });

  this.route("newsAdd", {
    template: "newsAdd",
    path: '/:scope/news/:_id/add',
    loadingTemplate: 'loading'
  });

  this.route("newsEdit", {
    template: "newsEdit",
    path: '/:scope/news/:_id/edit/:newsId',
    loadingTemplate: 'loading'
  });

  this.route("newsDetailComments", {
    template: "newsDetailComments",
    path: '/:scope/news/:_id/new/:newsId/comments'
  })

  this.route("commentsEdit", {
    template: "commentsEdit",
    path: '/:scope/news/:_id/edit/:newsId/comments/:commentId/edit',
    loadingTemplate: 'loading'
  });


  this.route('settings', {
    template: "settings",
    path: '/settings',
  });


  this.route('contacts', {
    template: "contacts",
    path: '/contacts'
  });

  this.route('changePosition', {
    template: "changePosition",
    path: '/cities'
  });

  this.route('notifications', {
    template: "notifications",
    path: '/notifications',
    loadingTemplate: 'loading'
  });

  this.route('searchGlobal', {
    template: "Page_search",
    path: '/search',
    loadingTemplate: 'loading'
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

Router.routes.login.options.progress = false;
Router.routes.signin.options.progress = false;
Router.routes.listEvents.options.progress = false;
