import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { AutoForm } from 'meteor/aldeed:autoform';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';
import { DeepLink } from 'meteor/communecter:deep-link';
import { TAPi18n } from 'meteor/tap:i18n';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { HTTP } from 'meteor/http';

// collections
import { ActivityStream } from '../../api/activitystream.js';
import { Documents } from '../../api/documents.js';

// schemas
import { SchemasEventsRest, BlockEventsRest } from '../../api/events.js';
import { SchemasOrganizationsRest, BlockOrganizationsRest } from '../../api/organizations.js';
import { SchemasProjectsRest, BlockProjectsRest } from '../../api/projects.js';
import { SchemasPoiRest, BlockPoiRest } from '../../api/poi.js';
import { SchemasClassifiedRest } from '../../api/classified.js';
import { SchemasFollowRest, SchemasInviteAttendeesEventRest, SchemasInvitationsRest, SchemasCitoyensRest, BlockCitoyensRest } from '../../api/citoyens.js';
import { SchemasNewsRest, SchemasNewsRestBase } from '../../api/news.js';
import { SchemasCommentsRest, SchemasCommentsEditRest } from '../../api/comments.js';
import { SchemasRoomsRest } from '../../api/rooms.js';
import { SchemasProposalsRest, BlockProposalsRest } from '../../api/proposals.js';
import { SchemasActionsRest } from '../../api/actions.js';

import { SchemasShareRest, SchemasRolesRest } from '../../api/schema.js';


Meteor.startup(function () {
  window.HTML.isConstructedObject = function(x) {
    return _.isObject(x) && !$.isPlainObject(x);
  };
  if (Meteor.isCordova && !Meteor.isDesktop) {
    DeepLink.once('INTENT', function(intent) {
      // console.log('INTENT');
      // console.log(intent);
      if (intent.split('#').length === 2) {
        // console.log('SPLIT');
        const urlArray = intent.split('#')[1].split('.');
        if (urlArray && urlArray.length === 4) {
          const type = urlArray[0];
          const detail = urlArray[1];
          const _id = urlArray[3];
          const scope = (type === 'person') ? 'citoyens' : `${type}s`;
          if (detail === 'detail') {
            if (scope === 'events' || scope === 'organizations' || scope === 'projects' || scope === 'citoyens') {
              Router.go('detailList', { scope, _id });
            }
          }
        } else if (urlArray && urlArray.length === 5) {
          const scope = urlArray[2];
          const page = urlArray[0];
          const _id = urlArray[4];
          if (page === 'page') {
            if (scope === 'events' || scope === 'organizations' || scope === 'projects' || scope === 'citoyens') {
              Router.go('detailList', { scope, _id });
            }
          }
        }
      } else {
        const regex = /\/co2\/person\/activate\/user\/([^/]*)\/validationKey\/([a-z0-9]*)/g;
        const m = regex.exec(intent);
        if (m && m[0] && m[1] && m[2]) {
          HTTP.get(m[0], {}, (error, response) => {
            if (error) {

            } else {
              return Router.go('/login');
            }
          });
        }
      }
    });

    DeepLink.once('communecter', function(data, url, scheme, path) {
      /*  console.log('communecter');
      console.log(url);
      console.log(scheme);
      console.log(path);
      console.log(querystring);

    communecter://
    communecter://login
    communecter://signin
    communecter://sign-out
    communecter://events
    communecter://organizations
    communecter://projects
    communecter://citoyens
    communecter://citoyens/:_id/edit
    communecter://organizations/add
    communecter://organizations/:_id/edit
    communecter://projects/add
    communecter://projects/:_id/edit
    communecter://events/add
    communecter://events/:_id/edit
    communecter://events/sous/:_id
    communecter://map/:scope/
    communecter://map/:scope/:_id
    communecter://:scope/news/:_id
    communecter://:scope/directory/:_id
    communecter://:scope/news/:_id/new/:newsId
    communecter://:scope/news/:_id/add
    communecter://:scope/news/:_id/edit/:newsId
    communecter://:scope/news/:_id/new/:newsId/comment
    communecter://:scope/news/:_id/edit/:newsId/comments/:commentId/edit
    communecter://organizations/members/:_id
    communecter://projects/contributors/:_id
    communecter://events/attendees/:_id
    communecter://citoyens/follows/:_id
    communecter://settings
    communecter://contact
    communecter://citie
    communecter://notifications
    communecter://search
    */
      Router.go(`/${path}`);
    });

    DeepLink.on('https', (data, url, scheme, path) => {
      /* console.log('HTTPS');
      console.log(url);
      console.log(scheme);
      console.log(path); */
    });
  }


  if (Meteor.isCordova) {
    window.alert = navigator.notification.alert;
    window.confirm = navigator.notification.confirm;
  }

  SchemasEventsRest.i18n('schemas.eventsrest');
  SchemasOrganizationsRest.i18n('schemas.organizationsrest');
  SchemasProjectsRest.i18n('schemas.projectsrest');
  SchemasPoiRest.i18n('schemas.poirest');
  SchemasClassifiedRest.i18n('schemas.classifiedrest');
  SchemasRoomsRest.i18n('schemas.roomsrest');
  SchemasProposalsRest.i18n('schemas.proposalsrest');
  BlockProposalsRest.i18n('schemas.blockproposalsrest');
  SchemasActionsRest.i18n('schemas.actionsrest');
  SchemasFollowRest.i18n('schemas.followrest');
  SchemasInviteAttendeesEventRest.i18n('schemas.followrest');
  SchemasShareRest.i18n('schemas.sharerest');
  SchemasRolesRest.i18n('schemas.rolesrest');
  SchemasNewsRest.i18n('schemas.news.global');
  SchemasNewsRestBase.citoyens.i18n('schemas.news.citoyens');
  SchemasNewsRestBase.projects.i18n('schemas.news.projects');
  SchemasNewsRestBase.organizations.i18n('schemas.news.organizations');
  SchemasNewsRestBase.events.i18n('schemas.news.events');
  SchemasCommentsRest.i18n('schemas.comments');
  SchemasCommentsEditRest.i18n('schemas.comments');
  SchemasCitoyensRest.i18n('schemas.citoyens');
  SchemasInvitationsRest.i18n('schemas.invitations');
  BlockCitoyensRest.info.i18n('schemas.global');
  BlockCitoyensRest.network.i18n('schemas.global');
  BlockCitoyensRest.descriptions.i18n('schemas.global');
  BlockCitoyensRest.locality.i18n('schemas.global');
  BlockCitoyensRest.preferences.i18n('schemas.global');
  BlockEventsRest.info.i18n('schemas.global');
  BlockEventsRest.network.i18n('schemas.global');
  BlockEventsRest.descriptions.i18n('schemas.global');
  BlockEventsRest.when.i18n('schemas.global');
  BlockEventsRest.locality.i18n('schemas.global');
  BlockEventsRest.preferences.i18n('schemas.global');
  BlockOrganizationsRest.info.i18n('schemas.global');
  BlockOrganizationsRest.network.i18n('schemas.global');
  BlockOrganizationsRest.descriptions.i18n('schemas.global');
  BlockOrganizationsRest.locality.i18n('schemas.global');
  BlockOrganizationsRest.preferences.i18n('schemas.global');
  BlockProjectsRest.info.i18n('schemas.global');
  BlockProjectsRest.network.i18n('schemas.global');
  BlockProjectsRest.descriptions.i18n('schemas.global');
  BlockProjectsRest.when.i18n('schemas.global');
  BlockProjectsRest.locality.i18n('schemas.global');
  BlockProjectsRest.preferences.i18n('schemas.global');
  BlockPoiRest.info.i18n('schemas.global');
  BlockPoiRest.descriptions.i18n('schemas.global');
  BlockPoiRest.locality.i18n('schemas.global');

  Template.registerHelper('equals', (v1, v2) => (v1 === v2));

  Template.registerHelper('nequals', (v1, v2) => (v1 !== v2));

  Template.registerHelper('diffInText', (start, end) => {
    const a = moment(start);
    const b = moment(end);
    const diffInMs = b.diff(a); // 86400000 milliseconds
    // const diffInDays = b.diff(a, 'days'); // 1 day
    const diffInDayText = moment.duration(diffInMs).humanize();
    return diffInDayText;
  },
  );

  Template.registerHelper('i18npref', (prefix, text) => TAPi18n.__(`${prefix}.${text}`));


  Template.registerHelper('isCordova', () => Meteor.isCordova);

  Template.registerHelper('textTags', (text, tags) => {
    if (text) {
      if (tags) {
        tags.sort((a, b) => b.length - a.length);
        _.each(tags, (value) => {
          text = text.replace(new RegExp(`#${value}`, 'g'), `<a href="" class="positive"><i class="icon fa fa-tag"></i>${value}</a>`);
        }, text);
      }
      return text;
    }
    return undefined;
  },
  );

  Template.registerHelper('notificationsCount', () => ActivityStream.api.Unseen());

  Template.registerHelper('notificationsCountRead', () => ActivityStream.api.Unread());

  Template.registerHelper('notificationsScopeCount', id => ActivityStream.api.Unseen(id));

  Template.registerHelper('notificationsScopeCountAsk', id => ActivityStream.api.UnseenAsk(id));

  Template.registerHelper('notificationsScopeCountRead', id => ActivityStream.api.Unread(id));

  Template.registerHelper('imageDoc', (id, profil) => {
    const query = {};
    if (id) {
      query.id = id;
      if (profil) {
        query.contentKey = 'profil';
      }
      return Documents.findOne(query, { sort: { created: -1 } });
    }
    if (this && this._id && this._id._str) {
      query.id = this._id._str;
      query.doctype = 'image';
      if (profil) {
        query.contentKey = 'profil';
      }
      return this && this._id && this._id._str && Documents.findOne(query, { sort: { created: -1 } });
    }
    return undefined;
  },
  );

  Template.registerHelper('currentFieldValue', function (fieldName) {
    return AutoForm.getFieldValue(fieldName) || false;
  });

  Template.registerHelper('equalFieldValue', function (fieldName, value) {
    return AutoForm.getFieldValue(fieldName) === value;
  });

  Template.registerHelper('urlImageCommunecter', function () {
    return Meteor.settings.public.urlimage;
  });

  Template.registerHelper('urlModuleCommunecter', function () {
    return Meteor.settings.public.module;
  });

  Template.registerHelper('urlImageDesktop', function () {
    // console.log(Meteor.settings.public.remoteUrl);
    return Meteor.isDesktop ? Meteor.settings.public.remoteUrl : '';
  });

  Template.registerHelper('SchemasFollowRest', SchemasFollowRest);
  Template.registerHelper('SchemasInviteAttendeesEventRest', SchemasInviteAttendeesEventRest);
  Template.registerHelper('SchemasInvitationsRest', SchemasInvitationsRest);
  Template.registerHelper('SchemasNewsRest', SchemasNewsRest);
  Template.registerHelper('SchemasEventsRest', SchemasEventsRest);
  Template.registerHelper('SchemasOrganizationsRest', SchemasOrganizationsRest);
  Template.registerHelper('SchemasPoiRest', SchemasPoiRest);
  Template.registerHelper('SchemasClassifiedRest', SchemasClassifiedRest);
  Template.registerHelper('SchemasProjectsRest', SchemasProjectsRest);
  Template.registerHelper('SchemasCommentsRest', SchemasCommentsRest);
  Template.registerHelper('SchemasCommentsEditRest', SchemasCommentsEditRest);
  Template.registerHelper('SchemasCitoyensRest', SchemasCitoyensRest);
  Template.registerHelper('SchemasShareRest', SchemasShareRest);
  Template.registerHelper('SchemasRolesRest', SchemasRolesRest);
  Template.registerHelper('SchemasRoomsRest', SchemasRoomsRest);
  Template.registerHelper('SchemasProposalsRest', SchemasProposalsRest);
  Template.registerHelper('BlockProposalsRest', BlockProposalsRest);
  Template.registerHelper('SchemasActionsRest', SchemasActionsRest);
});
