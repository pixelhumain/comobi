import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { MeteorCameraUI } from 'meteor/aboire:camera-ui';
import { AutoForm } from 'meteor/aldeed:autoform';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { IonPopup, IonModal, IonLoading } from 'meteor/meteoric:ionic';

import '../qrcode/qrcode.js';

// submanager
import { newsListSubs, filActusSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Poi } from '../../api/poi.js';
import { Classified } from '../../api/classified.js';
import { Citoyens } from '../../api/citoyens.js';
import { Rooms } from '../../api/rooms.js';
import { News, SchemasNewsRestBase } from '../../api/news.js';

import { nameToCollection } from '../../api/helpers.js';

import './news.html';

import '../components/directory/list.js';
import '../components/news/button-card.js';
import '../components/news/card.js';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Poi = Poi;
window.Classified = Classified;
window.Citoyens = Citoyens;
window.Rooms = Rooms;

const pageSession = new ReactiveDict('pageNews');

Template.newsList.onCreated(function() {
  this.readyScopeDetail = new ReactiveVar();

  pageSession.setDefault('limit', 5);
  pageSession.setDefault('limitFilActus', 5);

  this.autorun(function() {
    if (Router.current().route.getName() === 'newsList') {
      pageSession.set('selectview', 'scopeNewsTemplate');
    } else if (Router.current().route.getName() === 'notificationsList') {
      pageSession.set('selectview', 'scopeNotificationsTemplate');
    } else if (Router.current().route.getName() === 'actusList') {
      pageSession.set('selectview', 'scopeFilActusTemplate');
    } else if (Router.current().route.getName() === 'organizationsList') {
      pageSession.set('selectview', 'scopeOrganizationsTemplate');
    } else if (Router.current().route.getName() === 'projectsList') {
      pageSession.set('selectview', 'scopeProjectsTemplate');
    } else if (Router.current().route.getName() === 'poiList') {
      pageSession.set('selectview', 'scopePoiTemplate');
    } else if (Router.current().route.getName() === 'eventsList') {
      pageSession.set('selectview', 'scopeEventsTemplate');
    } else if (Router.current().route.getName() === 'roomsList') {
      pageSession.set('selectview', 'scopeRoomsTemplate');
    } else {
      pageSession.set('selectview', 'scopeDetailTemplate');
    }
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });


  this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    this.readyScopeDetail.set(handle.ready());
  }.bind(this));
});

Template.newsList.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
    // return undefined;
  },
  scopeCardTemplate () {
    return `listCard${Router.current().params.scope}`;
  },
  countsousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`);
  },
  issousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`) > 0;
  },
  isVote () {
    return this.type === 'vote';
  },
  dataReadyScopeDetail() {
    return Template.instance().readyScopeDetail.get();
  },
  selectview () {
    return pageSession.get('selectview');
  },
});

Template.scopeDetailTemplate.helpers({
  scopeCardTemplate () {
    return `listCard${Router.current().params.scope}`;
  },
  dataReadyScopeDetail() {
    return Template.instance().readyScopeDetail.get();
  },
});

Template.scopeNewsTemplate.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    if (pageSession.get('limit')) {
      IonLoading.show();
      const handle = newsListSubs.subscribe('newsList', Router.current().params.scope, Router.current().params._id, pageSession.get('limit'));
      if (handle.ready()) {
        IonLoading.hide();
        this.ready.set(handle.ready());
      }
    }
  }.bind(this));
});

Template.scopeNewsTemplate.onRendered(function() {
  const showMoreVisible = () => {
    const target = $('#showMoreResults');
    if (!target.length) {
      return;
    }
    const threshold = $('.content.overflow-scroll').scrollTop() + $('.content.overflow-scroll').height();
    if (target.offset().top < threshold) {
      if (!target.data('visible')) {
        target.data('visible', true);
        pageSession.set('limit',
          pageSession.get('limit') + 5);
      }
    } else if (target.data('visible')) {
      target.data('visible', false);
    }
  };

  $('.content.overflow-scroll').scroll(showMoreVisible);
});

Template.scopeNewsTemplate.helpers({
  scopeBoutonNewsTemplate () {
    return `boutonNews${Router.current().params.scope}`;
  },
  isLimit (countNews) {
    return countNews > pageSession.get('limit');
  },
  countNews () {
    // console.log(Router.current().params._id)
    return Counts.get(`countNews.${Router.current().params._id}`);
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.scopeFilActusTemplate.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    if (pageSession.get('limitFilActus')) {
      IonLoading.show();
      const handle = filActusSubs.subscribe('citoyenActusList', pageSession.get('limitFilActus'));
      if (handle.ready()) {
        IonLoading.hide();
        this.ready.set(handle.ready());
      }
    }
  }.bind(this));
});

Template.scopeFilActusTemplate.onRendered(function() {
  const showMoreVisible = () => {
    const target = $('#showMoreResultslimitFilActus');
    if (!target.length) {
      return;
    }
    const threshold = $('.content.overflow-scroll').scrollTop() + $('.content.overflow-scroll').height();
    if (target.offset().top < threshold) {
      if (!target.data('visiblelimitFilActus')) {
        target.data('visiblelimitFilActus', true);
        pageSession.set('limitFilActus',
          pageSession.get('limitFilActus') + 5);
      }
    } else if (target.data('visiblelimitFilActus')) {
      target.data('visiblelimitFilActus', false);
    }
  };

  $('.content.overflow-scroll').scroll(showMoreVisible);
});

Template.scopeFilActusTemplate.helpers({
  scopeBoutonNewsTemplate () {
    return `boutonFilActus${Router.current().params.scope}`;
  },
  isLimit (countNews) {
    return countNews > pageSession.get('limitFilActus');
  },
  countNews () {
    // console.log(Router.current().params._id)
    return Counts.get(`countActus.${Router.current().params._id}`);
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});


Template.scopeNotificationsTemplate.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    if (Router.current().params.scope !== 'events') {
      const handleToBeValidated = newsListSubs.subscribe('listMembersToBeValidated', Router.current().params.scope, Router.current().params._id);
      const handle = newsListSubs.subscribe('notificationsScope', Router.current().params.scope, Router.current().params._id);
      if (handleToBeValidated.ready() && handle.ready()) { this.ready.set(handle.ready()); }
    } else {
      const handle = newsListSubs.subscribe('notificationsScope', Router.current().params.scope, Router.current().params._id);
      if (handle.ready()) { this.ready.set(handle.ready()); }
    }
  }.bind(this));
});

Template.scopeNotificationsTemplate.helpers({
  scopeBoutonNotificationsTemplate () {
    return `boutonNotifications${Router.current().params.scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.scopeNotificationsTemplate.events({
  'click .validateYes'(event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    const scope = pageSession.get('scope');
    // console.log(`${scopeId},${scope},${this._id._str},${this.scopeVar()}`);
    Meteor.call('validateEntity', scopeId, scope, this._id._str, this.scopeVar(), 'toBeValidated', function(err) {
      if (err) {
        if (err.reason) {
          IonPopup.alert({ template: TAPi18n.__(err.reason) });
        }
      } else {
        // console.log('yes validate');
      }
    });
  },
  'click .validateNo'(event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    const scope = pageSession.get('scope');
    Meteor.call('disconnectEntity', scopeId, scope, undefined, this._id._str, this.scopeVar(), function(err) {
      if (err) {
        if (err.reason) {
          IonPopup.alert({ template: TAPi18n.__(err.reason) });
        }
      } else {
        // console.log('no validate');
      }
    });
  },
});

Template.scopeProjectsTemplate.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('directoryListProjects', Router.current().params.scope, Router.current().params._id);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopeProjectsTemplate.helpers({
  scopeBoutonProjectsTemplate () {
    return `boutonProjects${Router.current().params.scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.scopePoiTemplate.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('directoryListPoi', Router.current().params.scope, Router.current().params._id);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopePoiTemplate.helpers({
  scopeBoutonProjectsTemplate () {
    return `boutonPoi${Router.current().params.scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.scopeOrganizationsTemplate.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('directoryListOrganizations', Router.current().params.scope, Router.current().params._id);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopeOrganizationsTemplate.helpers({
  scopeBoutonProjectsTemplate () {
    return `boutonOrganizations${Router.current().params.scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.scopeEventsTemplate.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('directoryListEvents', Router.current().params.scope, Router.current().params._id);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopeEventsTemplate.helpers({
  scopeBoutonEventsTemplate () {
    return `boutonEvents${Router.current().params.scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.scopeRoomsTemplate.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('directoryListRooms', Router.current().params.scope, Router.current().params._id);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.scopeRoomsTemplate.helpers({
  scopeBoutonEventsTemplate () {
    return `boutonRooms${Router.current().params.scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.addMenuScopePopover.helpers({
  scopeVar () {
    return pageSession.get('scope');
  },
  scopeId() {
    return pageSession.get('scopeId');
  },
});


Template.newsList.events({
  'click .selectview' (event) {
    event.preventDefault();
    pageSession.set('selectview', event.currentTarget.id);
  },
  /*
  'click .saveattendees-link' (event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    Meteor.call('saveattendeesEvent', scopeId);
  },
  'click .inviteattendees-link' (event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    Meteor.call('inviteattendeesEvent', scopeId);
  },
  'click .connectscope-link' (event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    const scope = pageSession.get('scope');
    Meteor.call('connectEntity', scopeId, scope);
  }
  ,
  'click .disconnectscope-link' (event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    const scope = pageSession.get('scope');
    Meteor.call('disconnectEntity', scopeId, scope);
  }
  ,
  'click .followperson-link' (event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    const scope = pageSession.get('scope');
    Meteor.call('followEntity', scopeId, scope);
  },
  'click .unfollowperson-link' (event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    const scope = pageSession.get('scope');
    Meteor.call('disconnectEntity', scopeId, scope);
  },
  'click .unfollowscope-link' (event) {
    event.preventDefault();
    const scopeId = pageSession.get('scopeId');
    const scope = pageSession.get('scope');
    Meteor.call('disconnectEntity', scopeId, scope, 'followers');
  }, */
  'click .scanner-event'(event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      const scopeId = pageSession.get('scopeId');
      const scope = pageSession.get('scope');
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if (result.cancelled === false && result.text && result.format === 'QR_CODE') {
            let qr = {};
            if (result.text.split('#').length === 2) {
              const urlArray = result.text.split('#')[1].split('.');
              if (urlArray && urlArray.length === 4) {
                qr.type = urlArray[0];
                qr._id = urlArray[3];
              }
            } else {
              qr = JSON.parse(result.text);
            }
            if (qr && qr.type && qr._id) {
              if (qr.type === 'person') {
                if (scope === 'events') {
                  Meteor.call('saveattendeesEvent', scopeId, undefined, qr._id, function (error) {
                    if (!error) {
                      window.alert("Connexion à l'entité réussie");
                    } else {
                      window.alert(error.reason);
                      // console.log('error', error);
                    }
                  });
                } else if (scope === 'organizations') {
                  Meteor.call('connectEntity', scopeId, 'organizations', qr._id, function (error) {
                    if (!error) {
                      window.alert("Connexion à l'entité réussie");
                    } else {
                      window.alert(error.reason);
                      // console.log('error', error);
                    }
                  });
                } else if (scope === 'projects') {
                  Meteor.call('connectEntity', scopeId, 'projects', qr._id, function (error) {
                    if (!error) {
                      window.alert("Connexion à l'entité réussie");
                    } else {
                      window.alert(error.reason);
                      // console.log('error', error);
                    }
                  });
                }
              }
            }
          }
        },
        function (error) {
          alert(`Scanning failed: ${error}`);
        },
      );
    }
  },
  'click .give-me-more' () {
    const newLimit = pageSession.get('limit') + 5;
    pageSession.set('limit', newLimit);
  },
  'click .give-me-more-actus' () {
    const newLimit = pageSession.get('limitFilActus') + 5;
    pageSession.set('limitFilActus', newLimit);
  },
  'click .photo-link-new' (event, instance) {
    const self = this;
    const scope = pageSession.get('scope');

    if (Meteor.isDesktop) {
      pageSession.set('newsId', null);
      instance.$('#file-upload-new').trigger('click');
    } else if (Meteor.isCordova) {
      const options = {
        width: 640,
        height: 480,
        quality: 75,
      };

      const successCallback = (retour) => {
        const newsId = retour;
        IonPopup.confirm({ title: TAPi18n.__('Photo'),
          template: TAPi18n.__('Do you want to add another photo to this news'),
          onOk() {
            MeteorCameraUI.getPicture(options, function (error, data) {
              if (!error) {
                const str = `${+new Date() + Math.floor((Math.random() * 100) + 1)}.jpg`;
                Meteor.call('photoNews', data, str, scope, self._id._str, newsId, function (errorCall, result) {
                  if (!errorCall) {
                    successCallback(result.newsId);
                  } else {
                    // console.log('error',error);
                  }
                });
              }
            });
          },
          onCancel() {
            Router.go('newsList', { _id: self._id._str, scope });
          },
          cancelText: TAPi18n.__('finish'),
          okText: TAPi18n.__('other picture'),
        });
      };

      MeteorCameraUI.getPicture(options, function (error, data) {
        if (!error) {
          const str = `${+new Date() + Math.floor((Math.random() * 100) + 1)}.jpg`;
          Meteor.call('photoNews', data, str, scope, self._id._str, function (errorCall, result) {
            if (!errorCall) {
              successCallback(result.newsId);
            } else {
              // console.log('error',error);
            }
          });
        }
      });
    } else {
      pageSession.set('newsId', null);
      instance.$('#file-upload-new').trigger('click');
    }
  },
  'click .photo-link-scope' (event, instance) {
    event.preventDefault();
    const self = this;
    const scope = pageSession.get('scope');
    if (Meteor.isDesktop) {
      instance.$('#file-upload').trigger('click');
    } else if (Meteor.isCordova) {
      const options = {
        width: 640,
        height: 480,
        quality: 75,
      };
      MeteorCameraUI.getPicture(options, function (error, data) {
        if (!error) {
          const str = `${+new Date() + Math.floor((Math.random() * 100) + 1)}.jpg`;
          Meteor.call('photoScope', scope, data, str, self._id._str, function (errorPhoto) {
            if (!errorPhoto) {
              // console.log(result);
            } else {
              // console.log('error', error);
            }
          });
        }
      });
    } else {
      instance.$('#file-upload').trigger('click');
    }
  },
  'change #file-upload' (event, instance) {
    event.preventDefault();
    const self = this;
    const scope = pageSession.get('scope');
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      _.each(instance.find('#file-upload').files, function(file) {
        if (file.size > 1) {
          const reader = new FileReader();
          reader.onload = function() {
            // console.log(file.name);
            // console.log(file.type);
            // console.log(reader.result);
            // let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
            const str = file.name;
            const dataURI = reader.result;
            Meteor.call('photoScope', scope, dataURI, str, self._id._str, function (error) {
              if (!error) {
                // console.log(result);
              } else {
                // console.log('error',error);
              }
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },
  'change #file-upload-new' (event, instance) {
    event.preventDefault();
    const self = this;
    const scope = pageSession.get('scope');
    const newsId = pageSession.get('newsId');

    function successCallback (retour) {
      const newsId = retour;
      IonPopup.confirm({ title: TAPi18n.__('Photo'),
        template: TAPi18n.__('Do you want to add another photo to this news'),
        onOk() {
          pageSession.set('newsId', newsId);
          instance.$('#file-upload-new').trigger('click');
        },
        onCancel() {
          Router.go('newsList', { _id: self._id._str, scope });
        },
        cancelText: TAPi18n.__('finish'),
        okText: TAPi18n.__('other picture'),
      });
    }

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      _.each(instance.find('#file-upload-new').files, function(file) {
        if (file.size > 1) {
          const reader = new FileReader();
          reader.onload = function(e) {
          // console.log(file.name);
          // console.log(file.type);
          // console.log(reader.result);
          // let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
            const str = file.name;
            const dataURI = reader.result;
            if (newsId) {
              Meteor.call('photoNews', dataURI, str, scope, self._id._str, newsId, function (error, result) {
                if (!error) {
                  successCallback(result.newsId);
                } else {
                // console.log('error',error);
                }
              });
            } else {
              Meteor.call('photoNews', dataURI, str, scope, self._id._str, function (error, result) {
                if (!error) {
                  successCallback(result.newsId);
                } else {
                // console.log('error',error);
                }
              });
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },
});

Template.newsAdd.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('error', false);

  self.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  self.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    if (handle.ready()) {
      self.ready.set(handle.ready());
    }
  });
});

Template.newsAdd.onRendered(function () {
  const self = this;
  pageSession.set('error', false);
  pageSession.set('queryMention', false);
  pageSession.set('queryTag', false);
  pageSession.set('mentions', false);
  pageSession.set('tags', false);
  self.$('textarea').atwho({
    at: '@',
    limit: 10,
    delay: 600,
    displayTimeout: 300,
    startWithSpace: true,
    displayTpl(item) {
      return item.avatar ? `<li><img src='${item.avatar}' height='20' width='20'/> ${item.name}</li>` : `<li>${item.name}</li>`;
    },
    insertTpl: '${atwho-at}${slug}',
    searchKey: 'name',
  }).atwho({
    at: '#',
  }).on('matched.atwho', function(event, flag, query) {
    // console.log(event, "matched " + flag + " and the result is " + query);
    if (flag === '@' && query) {
      // console.log(pageSession.get('queryMention'));
      if (pageSession.get('queryMention') !== query) {
        pageSession.set('queryMention', query);
        const querySearch = {};
        querySearch.search = query;
        Meteor.call('searchMemberautocomplete', querySearch, function(error, result) {
          if (!error) {
            const citoyensArray = _.map(result.citoyens, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens' }));
            const organizationsArray = _.map(result.organizations, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations' }));
            const arrayUnions = _.union(citoyensArray, organizationsArray);
            // console.log(citoyensArray);
            self.$('textarea').atwho('load', '@', arrayUnions).atwho('run');
          }
        });
      }
    } else if (flag === '#' && query) {
      // console.log(pageSession.get('queryTag'));
      if (pageSession.get('queryTag') !== query) {
        pageSession.set('queryTag', query);
        Meteor.call('searchTagautocomplete', query, function(error, result) {
          if (!error) {
            // console.log(result);
            self.$('textarea').atwho('load', '#', result).atwho('run');
          }
        });
      }
    }
  })
    .on('inserted.atwho', function(event, $li) {
    // console.log(JSON.stringify($li.data('item-data')));

      if ($li.data('item-data')['atwho-at'] === '@') {
        const mentions = {};
        // const arrayMentions = [];
        mentions.name = $li.data('item-data').name;
        mentions.id = $li.data('item-data').id;
        mentions.type = $li.data('item-data').type;
        mentions.avatar = $li.data('item-data').avatar;
        mentions.value = ($li.data('item-data').slug ? $li.data('item-data').slug : $li.data('item-data').name);
        if (pageSession.get('mentions')) {
          const arrayMentions = pageSession.get('mentions');
          arrayMentions.push(mentions);
          pageSession.set('mentions', arrayMentions);
        } else {
          pageSession.set('mentions', [mentions]);
        }
      } else if ($li.data('item-data')['atwho-at'] === '#') {
        const tag = $li.data('item-data').name;
        if (pageSession.get('tags')) {
          const arrayTags = pageSession.get('tags');
          arrayTags.push(tag);
          pageSession.set('tags', arrayTags);
        } else {
          pageSession.set('tags', [tag]);
        }
      }
    });
});

Template.newsAdd.onDestroyed(function () {
  this.$('textarea').atwho('destroy');
});

Template.newsAdd.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
    return undefined;
  },
  error () {
    return pageSession.get('error');
  },
  blockSchema() {
    return Router.current().params.scope && SchemasNewsRestBase[Router.current().params.scope];
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.newsEdit.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('error', false);

  self.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  self.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    const handleScopeDetail = Meteor.subscribe('newsDetail', Router.current().params.scope, Router.current().params._id, Router.current().params.newsId);
    if (handle.ready() && handleScopeDetail.ready()) {
      self.ready.set(handle.ready());
    }
  });
});

Template.newsEdit.onRendered(function () {
  pageSession.set('error', false);
  pageSession.set('queryMention', false);
  pageSession.set('queryTag', false);
  pageSession.set('mentions', false);
  pageSession.set('tags', false);
});

Template.newsFields.onRendered(function () {
  const self = this;
  self.$('textarea').atwho({
    at: '@',
    limit: 10,
    delay: 600,
    displayTimeout: 300,
    startWithSpace: true,
    displayTpl(item) {
      return item.avatar ? `<li><img src='${item.avatar}' height='20' width='20'/> ${item.name}</li>` : `<li>${item.name}</li>`;
    },
    insertTpl: '${atwho-at}${slug}',
    searchKey: 'name',
  }).atwho({
    at: '#',
  }).on('matched.atwho', function(event, flag, query) {
    // console.log(event, "matched " + flag + " and the result is " + query);
    if (flag === '@' && query) {
      // console.log(pageSession.get('queryMention'));
      if (pageSession.get('queryMention') !== query) {
        pageSession.set('queryMention', query);
        const querySearch = {};
        querySearch.search = query;
        Meteor.call('searchMemberautocomplete', querySearch, function(error, result) {
          if (!error) {
            const citoyensArray = _.map(result.citoyens, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens' }));
            const organizationsArray = _.map(result.organizations, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations' }));
            const arrayUnions = _.union(citoyensArray, organizationsArray);
            // console.log(citoyensArray);
            self.$('textarea').atwho('load', '@', arrayUnions).atwho('run');
          }
        });
      }
    } else if (flag === '#' && query) {
      // console.log(pageSession.get('queryTag'));
      if (pageSession.get('queryTag') !== query) {
        pageSession.set('queryTag', query);
        Meteor.call('searchTagautocomplete', query, function(error, result) {
          if (!error) {
            // console.log(result);
            self.$('textarea').atwho('load', '#', result).atwho('run');
          }
        });
      }
    }
  })
    .on('inserted.atwho', function(event, $li) {
    // console.log(JSON.stringify($li.data('item-data')));

      if ($li.data('item-data')['atwho-at'] === '@') {
        const mentions = {};
        // const arrayMentions = [];
        mentions.name = $li.data('item-data').name;
        mentions.id = $li.data('item-data').id;
        mentions.type = $li.data('item-data').type;
        mentions.avatar = $li.data('item-data').avatar;
        mentions.value = ($li.data('item-data').slug ? $li.data('item-data').slug : $li.data('item-data').name);
        if (pageSession.get('mentions')) {
          const arrayMentions = pageSession.get('mentions');
          arrayMentions.push(mentions);
          pageSession.set('mentions', arrayMentions);
        } else {
          pageSession.set('mentions', [mentions]);
        }
      } else if ($li.data('item-data')['atwho-at'] === '#') {
        const tag = $li.data('item-data').name;
        if (pageSession.get('tags')) {
          const arrayTags = pageSession.get('tags');
          arrayTags.push(tag);
          pageSession.set('tags', arrayTags);
        } else {
          pageSession.set('tags', [tag]);
        }
      }
    });
});

Template.newsFields.onDestroyed(function () {
  this.$('textarea').atwho('destroy');
});

Template.newsEdit.helpers({
  new () {
    const news = News.findOne({ _id: new Mongo.ObjectID(Router.current().params.newsId) });
    const newEdit = {};
    newEdit._id = news._id._str;
    if (news && news.mentions) {
      pageSession.set('mentions', news.mentions);
    }
    if (news && news.tags) {
      pageSession.set('tags', news.tags);
    }
    newEdit.text = news.text;
    return newEdit;
  },
  blockSchema() {
    return Router.current().params.scope && SchemasNewsRestBase[Router.current().params.scope];
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

AutoForm.addHooks(['addNew', 'editNew'], {
  after: {
    method(error, result) {
      if (!error) {
        const selfresult = result.data.id.$id;
        const scopeId = pageSession.get('scopeId');
        const scope = pageSession.get('scope');

        const options = {
          width: 640,
          height: 480,
          quality: 75,
        };

        const successCallback = (retour) => {
          const newsId = retour;
          IonPopup.confirm({ title: TAPi18n.__('Photo'),
            template: TAPi18n.__('Do you want to add another photo to this news'),
            onOk() {
              MeteorCameraUI.getPicture(options, function (errorCamera, data) {
                if (!errorCamera) {
                  const str = `${+new Date() + Math.floor((Math.random() * 100) + 1)}.jpg`;
                  Meteor.call('photoNews', data, str, scope, scopeId, newsId, function (errorPhoto, resultPhoto) {
                    if (!errorPhoto) {
                      successCallback(resultPhoto.newsId);
                    } else {
                      // console.log('error',error);
                    }
                  });
                }
              });
            },
            onCancel() {
              Router.go('newsList', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope') });
            },
            cancelText: TAPi18n.__('finish'),
            okText: TAPi18n.__('other picture'),
          });
        };

        IonPopup.confirm({ title: TAPi18n.__('Photo'),
          template: TAPi18n.__('Voulez vous prendre une photo ?'),
          onOk() {
            MeteorCameraUI.getPicture(options, function (errorCamera, data) {
              if (!errorCamera) {
                const str = `${+new Date() + Math.floor((Math.random() * 100) + 1)}.jpg`;
                Meteor.call('photoNews', data, str, scope, scopeId, selfresult, function (errorPhoto, photoret) {
                  if (!errorPhoto) {
                    successCallback(photoret.newsId);
                  } else {
                    // console.log('error', error);
                  }
                });
              }
            });
          },
          onCancel() {

          },
          cancelText: TAPi18n.__('no'),
          okText: TAPi18n.__('yes'),
        });

        // Meteor.call('pushNewNewsAttendees',scopeId,selfresult);
        Router.go('newsList', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope') }, { replaceState: true });
      }
    },
    'method-update'(error) {
      if (!error) {
        Router.go('newsList', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope') }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      // console.log(doc);
      const scope = pageSession.get('scope');
      const scopeId = pageSession.get('scopeId');
      doc.parentType = scope;
      doc.parentId = scopeId;
      // comparer dans le text si @name present dans le array

      if (pageSession.get('mentions')) {
        const arrayMentions = _.reject(pageSession.get('mentions'), array => doc.text.match(`@${array.value}`) === null, doc.text);
        doc.mentions = arrayMentions;
      } else {
        // si on update est ce que la mention reste

      }
      const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
      const matches = [];
      let match;
      while ((match = regex.exec(doc.text))) {
        matches.push(match[1]);
      }
      if (pageSession.get('tags')) {
        const arrayTags = _.reject(pageSession.get('tags'), value => doc.text.match(`#${value}`) === null, doc.text);
        if (doc.tags) {
          doc.tags = _.uniq(_.union(doc.tags, arrayTags, matches));
        } else {
          doc.tags = _.uniq(_.union(arrayTags, matches));
        }
      } else if (matches.length > 0) {
        if (doc.tags) {
          doc.tags = _.uniq(_.union(doc.tags, matches));
        } else {
          doc.tags = _.uniq(matches);
        }
      }
      return doc;
    },
    'method-update'(modifier) {
      const scope = pageSession.get('scope');
      const scopeId = pageSession.get('scopeId');
      modifier.$set.parentType = scope;
      modifier.$set.parentId = scopeId;
      if (pageSession.get('mentions')) {
        const arrayMentions = _.reject(pageSession.get('mentions'), array => modifier.$set.text.match(`@${array.value}`) === null, modifier.$set.text);
        modifier.$set.mentions = arrayMentions;
      } else {
        // si on update est ce que la mention reste

      }

      const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
      const matches = [];
      let match;
      while ((match = regex.exec(modifier.$set.text))) {
        matches.push(match[1]);
      }
      if (pageSession.get('tags')) {
        const arrayTags = _.reject(pageSession.get('tags'), value => modifier.$set.text.match(`#${value}`) === null, modifier.$set.text);
        if (modifier.$set.tags) {
          modifier.$set.tags = _.uniq(_.union(modifier.$set.tags, arrayTags, matches));
        } else {
          modifier.$set.tags = _.uniq(_.union(arrayTags, matches));
        }
      } else if (matches.length > 0) {
        if (modifier.$set) {
          modifier.$set = _.uniq(_.union(modifier.$set, matches));
        } else {
          modifier.$set = _.uniq(matches);
        }
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

Template._inviteattendeesEvent.onCreated(function () {
  pageSession.set('error', false);
  pageSession.set('invitedUserEmail', false);
});

Template._inviteattendeesEvent.onRendered(function () {
  pageSession.set('error', false);
  pageSession.set('invitedUserEmail', false);
});

Template._inviteattendeesEvent.helpers({
  error () {
    return pageSession.get('error');
  },
});

AutoForm.addHooks(['inviteAttendeesEvent'], {
  before: {
    method(doc) {
      const scopeId = pageSession.get('scopeId');
      doc.eventId = scopeId;
      pageSession.set('invitedUserEmail', doc.invitedUserEmail);
      return doc;
    },
  },
  after: {
    method(error) {
      if (!error) {
        IonModal.close();
      }
    },
  },
  onError(formType, error) {
    // console.log(error);
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        if (error.reason === "Problème à l'insertion du nouvel utilisateur : une personne avec cet mail existe déjà sur la plateforme") {
          Meteor.call('saveattendeesEvent', pageSession.get('scopeId'), pageSession.get('invitedUserEmail'), function(errorSave) {
            if (errorSave) {
              pageSession.set('error', error.reason.replace(':', ' '));
            } else {
              IonModal.close();
            }
          });
        }
      } else {
        pageSession.set('error', error.reason.replace(':', ' '));
      }
    }
  },
});
