import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { AutoForm } from 'meteor/aldeed:autoform';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';
import { DeepLink } from 'meteor/communecter:deep-link';
import i18n from 'meteor/universe:i18n';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { HTTP } from 'meteor/http';
import { Blaze } from 'meteor/blaze';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';
import MarkdownIt from 'markdown-it';

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

import { notifyDisplay } from '../../api/helpers.js';

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
        // alert(`${Meteor.settings.public.endpoint}${m[0]}`);
        if (m && m[0] && m[1] && m[2]) {
          // ${Meteor.settings.public.endpoint}
          Meteor.call('validateEmail', `${Meteor.settings.public.endpoint}${m[0]}`, (error, result) => {
            if (error) {
              // alert(`${error}`);
            } else {
              // alert(`Ok`);
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

  const humanize = function (property) {
    return property
      .replace(/_/g, ' ')
      .replace(/(\w+)/g, function (match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
  };

  const getKeys = function (jsonPath, key) {
    // console.log(JSON.stringify(__([jsonPath, key].join('.'))));
    return __([jsonPath, key].join('.')) || {};
  };

  SimpleSchema.prototype.i18n = function (jsonPath, defaults) {
    if (Meteor.isServer) return;

    defaults = defaults || {};
    defaults.placeholder = defaults.placeholder || 'Type something...';
    defaults.firstOption = defaults.firstOption || 'Select something...';

    const schema = this._schema;
    _.each(schema, function (value, key) {
      // console.log(key);

      /* console.log(key);
        console.log(value);
        console.log(JSON.stringify(getKeys(jsonPath, key))); */

      if (!value) return;
      const keys = getKeys(jsonPath, key);

      schema[key].autoform = schema[key].autoform || {};

      if (schema[key].autoform.placeholder || keys.placeholder) {
        schema[key].autoform.placeholder = schema[key].autoform.placeholder || function () {
          return getKeys(jsonPath, key).placeholder || defaults.placeholder;
        };
      }

      if (schema[key].autoform.options || keys.options) {
        schema[key].autoform.options = schema[key].autoform.options || function () {
          const options = getKeys(jsonPath, key).options;
          _.each(options, function (option, key) {
            if (key.slice(-7) === '_plural') delete options[key];
          });
          return options;
        };
      }

      if (schema[key].autoform.firstOption || keys.options) {
        schema[key].autoform.firstOption = schema[key].autoform.firstOption || function () {
          return getKeys(jsonPath, key).placeholder || defaults.firstOption;
        };
      }

      schema[key].type.definitions.forEach((typeDef) => {
        if (!(SimpleSchema.isSimpleSchema(typeDef.type))) return;
        Object.keys(typeDef.type._schema).forEach((subKey) => {
          if (schema[key].type.definitions['0'].type._schema[subKey].label) {
            schema[key].type.definitions['0'].type._schema[subKey].label = function () {
              return getKeys(jsonPath, `${key}.${subKey}`).label || humanize(subKey);
            };
          }
        });
      });

      if (schema[key].autoform.label || keys.label) {
        schema[key].label = schema[key].autoform.label || function () {
          return getKeys(jsonPath, key).label || humanize(key);
        };
      }
    });

    /* schema.messageBox.messages({
    fr: {
      required: 'Veuillez saisir quelque chose',
      minString: 'Veuillez saisir au moins {{min}} caractères',
      maxString: 'Veuillez saisir moins de {{max}} caractères',
      minNumber: 'Ce champ doit être superieur ou égal à {{min}}',
      maxNumber: 'Ce champ doit être inferieur ou égal à {{max}}',
      minNumberExclusive: 'Ce champ doit être superieur à {{min}}',
      maxNumberExclusive: 'Ce champ doit être inferieur à {{max}}',
      minDate: 'La date doit est posterieure au {{min}}',
      maxDate: 'La date doit est anterieure au {{max}}',
      badDate: 'Cette date est invalide',
      minCount: 'Vous devez saisir plus de {{minCount}} valeurs',
      maxCount: 'Vous devez saisir moins de {{maxCount}} valeurs',
      noDecimal: 'Ce champ doit être un entier',
      notAllowed: "{{{value}}} n'est pas une valeur acceptée",
      expectedType: '{{{label}}} must be of type {{dataType}}',
      regEx({
        label,
        regExp,
      }) {
        switch (regExp) {
          case (SimpleSchema.RegEx.Email.toString()):
          case (SimpleSchema.RegEx.EmailWithTLD.toString()):
            return 'Cette adresse e-mail est incorrecte';
          case (SimpleSchema.RegEx.Domain.toString()):
          case (SimpleSchema.RegEx.WeakDomain.toString()):
            return 'Ce champ doit être un domaine valide';
          case (SimpleSchema.RegEx.IP.toString()):
            return 'Cette adresse IP est invalide';
          case (SimpleSchema.RegEx.IPv4.toString()):
            return 'Cette adresse IPv4 est invalide';
          case (SimpleSchema.RegEx.IPv6.toString()):
            return 'Cette adresse IPv6 est invalide';
          case (SimpleSchema.RegEx.Url.toString()):
            return 'Cette URL is invalide';
          case (SimpleSchema.RegEx.Id.toString()):
            return 'Cet identifiant alphanumérique est invalide';
          case (SimpleSchema.RegEx.ZipCode.toString()):
            return 'Ce code ZIP est invalide';
          case (SimpleSchema.RegEx.Phone.toString()):
            return 'Ce numéro de téléphone est invalide';
          default:
            return 'Ce champ a échoué la validation par Regex';
        }
      },
      keyNotInSchema: "Le champ {{name}} n'est pas permis par le schéma",
    },
  },); */
    this.messageBox.setLanguage(i18n.getLocale());

    return schema;
  };

  const registerSchemaMessages = () => {
    SchemasOrganizationsRest.i18n('schemas.organizationsrest');
    SchemasPoiRest.i18n('schemas.poirest');
    SchemasEventsRest.i18n('schemas.eventsrest');
    SchemasProjectsRest.i18n('schemas.projectsrest');
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
  };

  i18n.onChangeLocale(registerSchemaMessages);
  registerSchemaMessages();

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

  Template.registerHelper('calculateAge', (birth) => {
    const bday = moment(birth, 'YYYYMMDD HH:mm');
    const today = moment().startOf('day').hour(12);
    let age = today.year() - bday.year();
    if (bday > today.subtract(age, 'years')) { age -= 1; }
    return age;
  });

  Template.registerHelper('i18npref', (prefix, text) => i18n.__(`${prefix}.${text}`));


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

  Template.registerHelper('notifyDisplay', notify => notifyDisplay(notify));

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

  Template.registerHelper('getCount', (name) => {
    if (name) {
      return Counter.get(name);
    }
  });
  Template.registerHelper('hasPublishedCounter', (name) => {
    if (name) {
      const count = Counter.get(name);
      return count >= 0;
    }
  });

  Template.registerHelper('markdown', new Blaze.Template('markdown', function () {
    const view = this;
    let content = '';

    if (view.templateContentBlock) {
      content = Blaze._toText(view.templateContentBlock, HTML.TEXTMODE.STRING);
      // content = view.templateContentBlock;
    }
    const md = new MarkdownIt('default', {
      html: true,
      linkify: true,
      typographer: true,
    });

    const result = md.render(content);
    return HTML.Raw(result);
  }));

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
