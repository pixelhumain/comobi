import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';
import { _ } from 'meteor/underscore';
import { HTTP } from 'meteor/http';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';

// collection
import { ActivityStream } from '../activitystream.js';
import { Citoyens } from '../citoyens.js';
import { News } from '../news.js';
import { Documents } from '../documents.js';
import { Cities } from '../cities.js';
import { Events } from '../events.js';
import { Organizations } from '../organizations.js';
import { Projects } from '../projects.js';
import { Poi } from '../poi.js';
import { Classified } from '../classified.js';
import { Comments } from '../comments.js';
import { Lists } from '../lists.js';
import { Thing } from '../thing.js';
// DDA
import { Actions } from '../actions.js';
import { Resolutions } from '../resolutions.js';
import { Rooms } from '../rooms.js';
import { Proposals } from '../proposals.js';
// Game
import { Gamesmobile, Playersmobile, Questsmobile } from '../gamemobile.js';
import { Highlight } from '../highlight.js';

import { nameToCollection, arrayParent, arrayLinkParent, arrayChildrenParent } from '../helpers.js';

global.Events = Events;
global.Organizations = Organizations;
global.Projects = Projects;
global.Poi = Poi;
global.Classified = Classified;
global.Citoyens = Citoyens;
global.News = News;
global.Actions = Actions;
global.Resolutions = Resolutions;
global.Rooms = Rooms;
global.Proposals = Proposals;
global.Gamesmobile = Gamesmobile;

Events._ensureIndex({
  geoPosition: '2dsphere',
});
Projects._ensureIndex({
  geoPosition: '2dsphere',
});
Poi._ensureIndex({
  geoPosition: '2dsphere',
});
Classified._ensureIndex({
  geoPosition: '2dsphere',
});
Organizations._ensureIndex({
  geoPosition: '2dsphere',
});
Citoyens._ensureIndex({
  geoPosition: '2dsphere',
});
Cities._ensureIndex({
  geoShape: '2dsphere',
});
/* collection.rawCollection().createIndex(
{ geoPosition: "2dsphere"},
{ background: true }
, (e) => {
if(e){
console.log(e)
}
}); */

Meteor.publish('smartcitizenSearch', function(query) {
  const self = this;
  try {
    const response = HTTP.get('https://api.smartcitizen.me/v0/search?q=', {
      params: {
        q: query,
      },
    });
    // {"id":4123,"type":"Device","name":"Oceatoon 2","description":"reseau de capteur SCK Réunion ","owner_id":579,"owner_username":"oceatoon","city":"La Rivière Saint-Louis","url":"http://api.smartcitizen.me/v0/devices/4123","country_code":"RE","country":"Réunion"}
    _.each(response.data, function(item) {
      if (item.id) {
        const response = HTTP.get(item.url);
        const doc = item;

        self.added('smartcitizen', Random.id(), doc);
      }
    });
    self.ready();
  } catch (error) {
    // console.log(error);
  }
});

Meteor.publish('globalautocomplete', function(query) {
  check(query, {
    name: String,
    searchType: Array,
    searchBy: String,
    indexMin: Number,
    indexMax: Number,
  });

  const self = this;
  try {
    const response = HTTP.post(`${Meteor.settings.endpoint}/communecter/search/globalautocomplete`, {
      params: query,
    });
    _.each(response.data, function(item) {
      const doc = item;
      self.added('search', Random.id(), doc);
    });
    self.ready();
  } catch (error) {
    // console.log(error);
  }
});

Meteor.publish('lists', function(name) {
  if (!this.userId) {
    return null;
  }
  check(name, String);
  const lists = Lists.find({ name });
  return lists;
});

Meteor.publish('notificationsUser', function() {
  if (!this.userId) {
    return null;
  }
  Counts.publish(this, `notifications.${this.userId}.Unseen`, ActivityStream.api.queryUnseen(this.userId), { noReady: true });
  Counts.publish(this, `notifications.${this.userId}.Unread`, ActivityStream.api.queryUnread(this.userId), { noReady: true });
  return ActivityStream.api.isUnread(this.userId);
});

Meteor.publish('notificationsScope', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  if (!collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isAdmin(this.userId)) {
    return null;
  }
  Counts.publish(this, `notifications.${scopeId}.Unseen`, ActivityStream.api.queryUnseen(this.userId, scopeId), { noReady: true });
  Counts.publish(this, `notifications.${scopeId}.Unread`, ActivityStream.api.queryUnread(this.userId, scopeId), { noReady: true });
  Counts.publish(this, `notifications.${scopeId}.UnseenAsk`, ActivityStream.api.queryUnseenAsk(this.userId, scopeId), { noReady: true });
  return collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).listNotifications(this.userId);
});

Meteor.publish('getcitiesbylatlng', function(latlng) {
  check(latlng, { latitude: Number, longitude: Number });
  if (!this.userId) {
    return null;
  }

  return Cities.find({ geoShape:
    { $geoIntersects:
      { $geometry: { type: 'Point',
        coordinates: [latlng.longitude, latlng.latitude] },
      },
    },
  });
});

Meteor.publish('cities', function(cp, country) {
  if (!this.userId) {
    return null;
  }
  check(cp, String);
  check(country, String);
  const lists = Cities.find({ 'postalCodes.postalCode': cp, country });
  return lists;
});

Meteor.publish('organizerEvents', function(organizerType) {
  if (!this.userId) {
    return null;
  }
  check(organizerType, String);
  check(organizerType, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'citoyens'], name);
  }));
  if (organizerType === 'organizations') {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).listOrganizationsCreator();
  } else if (organizerType === 'projects') {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).listProjectsCreator();
  } else if (organizerType === 'citoyens') {
    return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1 } });
  }
});


Meteor.publish('citoyen', function() {
  if (!this.userId) {
    return null;
  }
  const objectId = new Mongo.ObjectID(this.userId);
  const citoyen = Citoyens.find({ _id: objectId }, { fields: { pwd: 0 } });
  return citoyen;
});

Meteor.publish('geo.dashboard', function (geoId, latlng, radius) {
  if (!this.userId) {
    return null;
  }
  check(geoId, String);
  check(latlng, Object);
  const query = {};
  if (radius) {
    check(radius, Number);
    check(latlng.longitude, Number);
    check(latlng.latitude, Number);
    query.geoPosition = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [latlng.longitude, latlng.latitude],
        },
        $maxDistance: radius,
      },
    };
  } else {
    check(latlng.type, String);
    check(latlng.coordinates, Array);
    query.geoPosition = {
      $geoIntersects: {
        $geometry: {
          type: latlng.type,
          coordinates: latlng.coordinates,
        },
      },
    };
  }
  // console.log(geoId);

  const counterEvents = new Counter(`countScopeGeo.${geoId}.events`, Events.find(query));
  const counterOrganizations = new Counter(`countScopeGeo.${geoId}.organizations`, Organizations.find(query));
  const counterProjects = new Counter(`countScopeGeo.${geoId}.projects`, Projects.find(query));
  const counterPoi = new Counter(`countScopeGeo.${geoId}.poi`, Poi.find(query));
  const counterClassified = new Counter(`countScopeGeo.${geoId}.classified`, Classified.find(query));
  query._id = { $ne: new Mongo.ObjectID(this.userId) };
  const counterCitoyens = new Counter(`countScopeGeo.${geoId}.citoyens`, Citoyens.find(query));

  return [
    counterEvents,
    counterOrganizations,
    counterProjects,
    counterPoi,
    counterClassified,
    counterCitoyens,
  ];
});

Meteor.publish('geo.dashboardOld', function(geoId, latlng, radius) {
  const query = {};
  if (radius) {
    query.geoPosition = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [latlng.longitude, latlng.latitude],
        },
        $maxDistance: radius,
      } };
  } else {
    query.geoPosition = {
      $geoIntersects: {
        $geometry: {
          type: latlng.type,
          coordinates: latlng.coordinates,
        },
      },
    };
  }
  // console.log(geoId);
  Counts.publish(this, `countScopeGeo.${geoId}.events`, Events.find(query));
  Counts.publish(this, `countScopeGeo.${geoId}.organizations`, Organizations.find(query));
  Counts.publish(this, `countScopeGeo.${geoId}.projects`, Projects.find(query));
  Counts.publish(this, `countScopeGeo.${geoId}.poi`, Poi.find(query));
  Counts.publish(this, `countScopeGeo.${geoId}.classified`, Classified.find(query));

  query._id = { $ne: new Mongo.ObjectID(this.userId) };
  Counts.publish(this, `countScopeGeo.${geoId}.citoyens`, Citoyens.find(query));
});


// Geo scope
// scope string collection
// latlng object
// radius string
Meteor.publishComposite('geo.scope', function(scope, latlng, radius) {
  // check(latlng, Object);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'poi', 'classified', 'organizations', 'citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }

  return {
    find() {
      const options = {};
      options._disableOplog = true;
      if (scope === 'citoyens') {
        // options.fields = { pwd: 0 };
      }

      options.fields = { _id: 1,
        profilThumbImageUrl: 1,
        type: 1,
        startDate: 1,
        endDate: 1,
        geo: 1,
        name: 1,
        organizerType: 1,
        organizerId: 1,
        parentType: 1,
        parentId: 1,
        creator: 1,
        geoPosition: 1,
        'address.codeInsee': 1,
        tags: 1 };

      const query = {};
      if (radius) {
        query.geoPosition = {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [latlng.longitude, latlng.latitude],
            },
            $maxDistance: radius,
          } };
      } else {
        query.geoPosition = {
          $geoIntersects: {
            $geometry: {
              type: latlng.type,
              coordinates: latlng.coordinates,
            },
          },
        };
      }
      if (scope === 'citoyens') {
        query._id = { $ne: new Mongo.ObjectID(this.userId) };
      }
      if (scope === 'events') {
        query.endDate = { $gte: new Date() };
      }

      // Counts.publish(this, `countScopeGeo.${scope}`, collection.find(query), { noReady: true });
      console.log(query);
      return collection.find(query, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'events') {
            return scopeD.listEventTypes();
          } else if (scope === 'organizations') {
            return scopeD.listOrganisationTypes();
          }
        },
      }, /* ,      {
        find(scopeD) {
          return scopeD.documents();
        },
      } */
      {
        find(scopeD) {
          if (scope === 'events') {
            if (scopeD.organizerType && scopeD.organizerId && _.contains(['events', 'projects', 'organizations', 'citoyens'], scopeD.organizerType)) {
              const collectionType = nameToCollection(scopeD.organizerType);
              return collectionType.find({
                _id: new Mongo.ObjectID(scopeD.organizerId),
              }, {
                fields: {
                  name: 1,
                },
              });
            }
          } else if (scope === 'projects' || scope === 'poi' || scope === 'classified') {
            if (scopeD.parentType && scopeD.parentId && _.contains(['events', 'projects', 'poi', 'classified', 'organizations', 'citoyens'], scopeD.parentType)) {
              const collectionType = nameToCollection(scopeD.parentType);
              return collectionType.find({
                _id: new Mongo.ObjectID(scopeD.parentId),
              }, {
                fields: {
                  name: 1,
                },
              });
            }
          }
        },
      },
    ] };
});


Meteor.publishComposite('scopeDetail', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'poi', 'classified', 'organizations', 'citoyens', 'actions', 'rooms', 'proposals', 'resolutions'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      //
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({ parentId: scopeId }), { noReady: true });
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'events') {
            return scopeD.listEventTypes();
          } else if (scope === 'organizations') {
            return scopeD.listOrganisationTypes();
          }
        },
      },
      {
        find(scopeD) {
          return Citoyens.find({
            _id: new Mongo.ObjectID(scopeD.creator),
          }, {
            fields: {
              name: 1,
              profilThumbImageUrl: 1,
            },
          });
        },
      },
      {
        find(scopeD) {
          if (scope !== 'citoyens') {
            return Citoyens.find({
              _id: new Mongo.ObjectID(this.userId),
            }, {
              fields: {
                name: 1,
                links: 1,
                collections: 1,
                profilThumbImageUrl: 1,
              },
            });
          }
        },
      },
      {
        find(scopeD) {
          if (scope === 'events') {
            if (scopeD.organizerType && scopeD.organizerId && _.contains(['events', 'projects', 'organizations', 'citoyens'], scopeD.organizerType)) {
              const collectionType = nameToCollection(scopeD.organizerType);
              return collectionType.find({
                _id: new Mongo.ObjectID(scopeD.organizerId),
              }, {
                fields: {
                  name: 1,
                  links: 1,
                  profilThumbImageUrl: 1,
                },
              });
            }
          } else if (scope === 'projects' || scope === 'poi' || scope === 'classified') {
            if (scopeD.parentType && scopeD.parentId && _.contains(['events', 'projects', 'poi', 'organizations', 'citoyens'], scopeD.parentType)) {
              const collectionType = nameToCollection(scopeD.parentType);
              return collectionType.find({
                _id: new Mongo.ObjectID(scopeD.parentId),
              }, {
                fields: {
                  name: 1,
                  links: 1,
                  profilThumbImageUrl: 1,
                },
              });
            }
          }
        },
      },
      {
        find(scopeD) {
          if (scope === 'events') {
            if (scopeD.parentId) {
              return Events.find({
                _id: new Mongo.ObjectID(scopeD.parentId),
              }, {
                fields: {
                  name: 1,
                  links: 1,
                  profilThumbImageUrl: 1,
                },
              });
            }
          }
        },
      },
      {
        find(scopeD) {
          if (scopeD && scopeD.address && scopeD.address.postalCode) {
            return Cities.find({
              'postalCodes.postalCode': scopeD.address.postalCode,
            });
          }
        },
      }, /* ,
      {
        find(scopeD) {
          return scopeD.documents();
        },
      }, */
    ] };
});

Meteor.publish('citoyenActusListCounter', function (geoId, latlng, radius) {
  if (!this.userId) {
    return null;
  }
  return new Counter(`countActus.${this.userId}`, Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).newsActus(this.userId));
});

Meteor.publishComposite('citoyenActusList', function(limit) {
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scopeD && scopeD.address && scopeD.address.postalCode) {
            return Cities.find({
              'postalCodes.postalCode': scopeD.address.postalCode,
            });
          }
        },
      },
      {
        find(scopeD) {
          // Counts.publish(this, `countActus.${this.userId}`, scopeD.newsActus(this.userId), { noReady: true });
          return scopeD.newsActus(this.userId, limit);
        },
        children: [
          {
            find(news) {
              /* ////console.log(news.author); */
              return Citoyens.find({
                _id: new Mongo.ObjectID(news.author),
              }, {
                fields: {
                  name: 1,
                  profilThumbImageUrl: 1,
                },
              });
            }, /* ,
            children: [
              {
                find(citoyen) {
                  return citoyen.documents();
                },
              },
            ], */
          },
          {
            find(news) {
              return news.photoNewsAlbums();
            },
          },
          {
            find(news) {
              const queryOptions = { fields: {
                _id: 1,
                name: 1,
                profilThumbImageUrl: 1,
              } };
              if (news.target && news.target.type && news.target.id) {
                const collection = nameToCollection(news.target.type);
                return collection.find({ _id: new Mongo.ObjectID(news.target.id) }, queryOptions);
              }
            },
          }, /*
          {
            find(news) {
              if (news.target && news.target.type && news.target.id) {
                return Documents.find({
                  id: news.target.id,
                  contentKey: 'profil',
                }, { sort: { created: -1 }, limit: 1 });
              }
            },
          }, */
          {
            find(news) {
              const queryOptions = {};
              if (news.object && news.object.type === 'actions') {
                queryOptions.fields = {
                  _id: 1,
                  name: 1,
                  idParentRoom: 1,
                  profilThumbImageUrl: 1,
                };
              } else if (news.object && news.object.type === 'proposals') {
                queryOptions.fields = {
                  _id: 1,
                  title: 1,
                  idParentRoom: 1,
                  profilThumbImageUrl: 1,
                };
              } else {
                queryOptions.fields = {
                  _id: 1,
                  name: 1,
                  profilThumbImageUrl: 1,
                };
              }
              if (news.object && news.object.type && news.object.id) {
                // console.log(news.object.type);
                const collection = nameToCollection(news.object.type);
                return collection.find({ _id: new Mongo.ObjectID(news.object.id) }, queryOptions);
              }
            },
          }, /*
          {
            find(news) {
              if (news.object && news.object.type && news.object.id) {
                return Documents.find({
                  id: news.object.id,
                  contentKey: 'profil',
                }, { sort: { created: -1 }, limit: 1 });
              }
            },
          }, */
        ],
      },
    ] };
});

Meteor.publishComposite('collectionsList', function(scope, scopeId, type) {
  check(scopeId, String);
  check(type, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          return Lists.find({ name: { $in: ['eventTypes', 'organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'citoyens');
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'organizations');
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'projects');
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'events');
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'poi');
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'classified');
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      }, /* ,
      {
        find(scopeD) {
          return scopeD.documents();
        },
      }, */
    ] };
});

Meteor.publishComposite('directoryList', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        // options.fields = { pwd: 0 };
      }

      options.fields = { _id: 1,
        profilThumbImageUrl: 1,
        type: 1,
        name: 1,
        organizerType: 1,
        organizerId: 1,
        parentType: 1,
        parentId: 1,
        creator: 1,
        tags: 1,
        links: 1 };

      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          return Lists.find({ name: { $in: ['eventTypes', 'organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listFollowers();
          } else if (scope === 'organizations') {
            return scopeD.listFollowers();
          } else if (scope === 'projects') {
            return scopeD.listFollowers();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listFollows();
          } else if (scope === 'organizations') {
            return scopeD.listMembers();
          } else if (scope === 'projects') {
            return scopeD.listContributors();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listMemberOf();
          } else if (scope === 'organizations') {
            return scopeD.listMembersOrganizations();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations') {
            return scopeD.listProjects();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects') {
            return scopeD.listEvents();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      }, /* ,
      {
        find(scopeD) {
          return scopeD.documents();
        },
      }, */
    ] };
},
);

Meteor.publishComposite('directoryListEvents', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          return Lists.find({ name: { $in: ['eventTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listEventsCreator();
          }
        },
        children: [
          {
            find(scopeD) {
              if (scopeD.organizerType && scopeD.organizerId && _.contains(['citoyens', 'organizations', 'projects', 'events'], scopeD.organizerType)) {
                const collectionType = nameToCollection(scopeD.organizerType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.organizerId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          }, /* ,
          {
            find(scopeD) {
              return scopeD.documents();
            },
          }, */
        ],
      }, /* ,
      {
        find(scopeD) {
          return scopeD.documents();
        },
      }, */
    ] };
});


Meteor.publishComposite('highlight', function (localityId) {
  check(localityId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const inputDate = new Date();
      const query = {};
      query.startDate = { $lte: inputDate };
      query.endDate = { $gte: inputDate };
      query.localityId = localityId;
      return Highlight.find(query);
    },
    children: [
      {
        find(scopeD) {
          if (scopeD.parentType && scopeD.parentId && _.contains(['projects', 'organizations', 'events', 'gamesmobile'], scopeD.parentType)) {
            const collectionType = nameToCollection(scopeD.parentType);
            return collectionType.find({
              _id: new Mongo.ObjectID(scopeD.parentId),
            }, {
              fields: {
                links: 0,
              },
            });
          }
        },
      },
      {
        find(scopeD) {
          if (scopeD.parentType === 'events') {
            return Lists.find({ name: { $in: ['eventTypes'] } });
          } else if (scopeD.parentType === 'organizations') {
            return Lists.find({ name: { $in: ['organisationTypes'] } });
          }
        },
      },
    ],
  };
});

Meteor.publishComposite('directoryListGames', function (scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return collection.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'events') {
            return scopeD.listGamesCreator();
          }
        },
        children: [
          {
            find(scopeD) {
              if (scopeD.parentType && scopeD.parentId && _.contains(['events'], scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('directoryListProjects', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['organizations', 'citoyens', 'projects'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects') {
            return scopeD.listProjectsCreator();
          }
        },
        children: [
          {
            find(scopeD) {
              if (scopeD.parentType && scopeD.parentId && _.contains(['organizations', 'projects'], scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          }, /* ,
          {
            find(scopeD) {
              return scopeD.documents();
            },
          }, */
        ],
      }, /* ,
      {
        find(scopeD) {
          return scopeD.documents();
        },
      }, */
    ] };
});

Meteor.publishComposite('directoryListPoi', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listPoiCreator();
          }
        },
        children: [
          {
            find(scopeD) {
              if (scopeD.parentType && scopeD.parentId && _.contains(['citoyens', 'organizations', 'projects', 'events'], scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          }, /* ,
          {
            find(scopeD) {
              return scopeD.documents();
            },
          }, */
        ],
      }, /* ,
      {
        find(scopeD) {
          return scopeD.documents();
        },
      }, */
    ] };
});

Meteor.publishComposite('directoryListRooms', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            const options = {};
            options.fields = {
              _id: 1,
              name: 1,
              profilThumbImageUrl: 1,
            };
            let scopeCible = scope;
            if (scope === 'organizations') {
              scopeCible = 'memberOf';
            }
            options.fields[`links.${scopeCible}`] = 1;
            return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, options);
          }
        },
        children: [
          {
            find(citoyen, scopeD) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return scopeD.listRooms();
              }
            },
          },
        ],
      },
    ] };
});

Meteor.publishComposite('directoryListClassified', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listClassifiedCreator();
          }
        },
        // children: arrayChildrenParent(scope, ['citoyens', 'organizations', 'projects', 'events']),
        children: [
          {
            find(scopeD) {
              if (scopeD.parentType && scopeD.parentId && _.contains(['citoyens', 'organizations', 'projects', 'events'], scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          },
        ],
      },
    ] };
});

Meteor.publishComposite('directoryListOrganizations', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listOrganizationsCreator();
          }
        },
      },
    ] };
});

Meteor.publishComposite('directoryListInvitations', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listOrganizationsCreator();
          }
        },
      },
      {
        find(citoyen) {
          return citoyen.listFollows();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          },
        ],
      },
    ] };
});

Meteor.publish('listeventSous', function (scopeId) {
  check(scopeId, String);
  if (!this.userId) {
    return null;
  }

  const counterEvents = new Counter(`countSous.${scopeId}`, Events.find({ parentId: scopeId }));

  return [
    counterEvents,
    Events.find({ parentId: scopeId }),
  ];
});


/* Meteor.publishComposite('listeventSous', function(scopeId) {
  check(scopeId, String);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      Counts.publish(this, `countSous.${scopeId}`, Events.find({ parentId: scopeId }), { noReady: true });
      return Events.find({ parentId: scopeId });
    },
  };
}); */

Meteor.publishComposite('detailRooms', function(scope, scopeId, roomId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            const options = {};
            options.fields = {
              _id: 1,
              name: 1,
              profilThumbImageUrl: 1,
            };
            let scopeCible = scope;
            if (scope === 'organizations') {
              scopeCible = 'memberOf';
            }
            options.fields[`links.${scopeCible}`] = 1;
            return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, options);
          }
        },
        children: [
          {
            find(citoyen, scopeD) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return scopeD.detailRooms(roomId);
              }
            },
            children: [
              {
                find(room) {
                  if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                    return room.listProposals();
                  }
                },
              },
              {
                find(room) {
                  if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                    return room.listActions();
                  }
                },
              },
              {
                find(room) {
                  if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                    return room.listResolutions();
                  }
                },
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('detailProposals', function(scope, scopeId, roomId, proposalId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(proposalId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find(room) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return Proposals.find({ _id: new Mongo.ObjectID(proposalId) });
              }
            },
            children: [
              {
                find(proposal) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(proposal.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('proposalsDetailComments', function(scope, scopeId, roomId, proposalId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(proposalId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find(room) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return Proposals.find({ _id: new Mongo.ObjectID(proposalId) });
              }
            },
            children: [
              {
                find(proposal) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(proposal.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
              {
                find(proposal) {
                  return proposal.listComments();
                },
                children: [
                  {
                    find(comment) {
                      return Citoyens.find({
                        _id: new Mongo.ObjectID(comment.author),
                      }, {
                        fields: {
                          name: 1,
                          profilThumbImageUrl: 1,
                        },
                      });
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('detailActions', function(scope, scopeId, roomId, actionId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(actionId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find(room) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return Actions.find({ _id: new Mongo.ObjectID(actionId) });
              }
            },
            children: [
              {
                find(action) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(action.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
              {
                find(action) {
                  return action.listMembersToBeValidated();
                },
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('actionsDetailComments', function(scope, scopeId, roomId, actionId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(actionId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find(room) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return Actions.find({ _id: new Mongo.ObjectID(actionId) });
              }
            },
            children: [
              {
                find(action) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(action.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
              {
                find(action) {
                  return action.listComments();
                },
                children: [
                  {
                    find(comment) {
                      return Citoyens.find({
                        _id: new Mongo.ObjectID(comment.author),
                      }, {
                        fields: {
                          name: 1,
                          profilThumbImageUrl: 1,
                        },
                      });
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('detailResolutions', function(scope, scopeId, roomId, resolutionId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(resolutionId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find(scopeD) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return Resolutions.find({ _id: new Mongo.ObjectID(resolutionId) });
              }
            },
            children: [
              {
                find(resolution) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(resolution.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('detailGames', function (gameId) {
  check(gameId, String);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return Gamesmobile.find({ _id: new Mongo.ObjectID(gameId) }, options);
    },
    children: [
      {
        find(game) {
          const query = {};
          query.idGame = game._id._str;
          query.idUser = this.userId;
          const queryOptions = {};
          queryOptions.fields = {};
          queryOptions.fields.idGame = 1;
          queryOptions.fields.idUser = 1;
          queryOptions.fields.totalPoint = 1;
          queryOptions.fields.validateQuest = 1;
          queryOptions.fields.errorQuest = 1;
          queryOptions.fields.createdAt = 1;
          // queryOptions
          return Playersmobile.find(query);
        },
        children: [
          {
            find(player) {
              return player.listQuestsNoValid();
            },
          },
          {
            find(player) {
              return player.listQuestsValid();
            },
            children: [
              {
                find(quest) {
                  if (quest.questType && quest.questId) {
                    const collection = nameToCollection(quest.questType);
                    return collection.find({ _id: new Mongo.ObjectID(quest.questId) });
                  }
                },
              },
            ],
          },
          {
            find(player) {
              return Citoyens.find({
                _id: new Mongo.ObjectID(player.idUser),
              }, {
                fields: {
                  name: 1,
                  profilThumbImageUrl: 1,
                },
              });
            },
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('gameScoreBoard', function (gameId) {
  check(gameId, String);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return Gamesmobile.find({ _id: new Mongo.ObjectID(gameId) }, options);
    },
    children: [
      {
        find(game) {
          return game.listPlayers();
        },
        children: [
          {
            find(player) {
              return Citoyens.find({
                _id: new Mongo.ObjectID(player.idUser),
              }, {
                fields: {
                  name: 1,
                  profilThumbImageUrl: 1,
                },
              });
            },
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('listAttendees', function(scopeId) {
  check(scopeId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Events.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(scopeD) {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(event) {
          return event.listAttendeesValidate();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
      {
        find(event) {
          return event.listAttendeesIsInviting();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
      {
        find(event) {
          // test
          /* let order = 1;
          const idGame = 'ecd1197a262518a44fda35f3';
          const arrayOrg = event.listAttendeesOrgaValidate().map((org) => {
            order += 1;
            return {
              idGame: idGame,
              pointWin: 5,
              order: order,
              question: org.name,
              questType: 'organizations',
              questId: org._id._str,
            }
          });
          console.log(JSON.stringify(arrayOrg)); */
          return event.listAttendeesOrgaValidate();
        },
      },
    ] };
});

Meteor.publishComposite('listMembers', function(scopeId) {
  check(scopeId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Organizations.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(organisation) {
          return organisation.listMembers();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publishComposite('listMembersToBeValidated', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['organizations', 'projects'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return collection.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(organisation) {
          return organisation.listMembersToBeValidated();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publishComposite('listContributors', function(scopeId) {
  check(scopeId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Projects.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(project) {
          return project.listContributors();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publishComposite('listFollows', function(scopeId) {
  check(scopeId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Citoyens.find({ _id: new Mongo.ObjectID(scopeId) }, {
        fields: {
          _id: 1,
          name: 1,
          'links.follows': 1,
          profilThumbImageUrl: 1,
        },
      });
    },
    children: [
      {
        find(citoyen) {
          return citoyen.listFollows();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publish('newsListCounter', function (scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }
  const collection = nameToCollection(scope);
  return new Counter(`countNews.${scopeId}`, collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).newsJournal(scopeId, this.userId));
});

Meteor.publishComposite('newsList', function(scope, scopeId, limit) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }

  return {
    find() {
      const collection = nameToCollection(scope);
      // Counts.publish(this, `countNews.${scopeId}`, collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).newsJournal(scopeId, this.userId), { noReady: true });
      return collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).newsJournal(scopeId, this.userId, limit);
    },
    children: [
      {
        find(news) {
          /* ////console.log(news.author); */
          return Citoyens.find({
            _id: new Mongo.ObjectID(news.author),
          }, {
            fields: {
              name: 1,
              profilThumbImageUrl: 1,
            },
          });
        }, /* ,
        children: [
          {
            find(citoyen) {
              return citoyen.documents();
            },
          },
        ], */
      },
      {
        find(news) {
          return news.photoNewsAlbums();
        },
      },
      {
        find(news) {
          const queryOptions = { fields: {
            _id: 1,
            name: 1,
            profilThumbImageUrl: 1,
          } };
          if (news.target && news.target.type && news.target.id) {
            const collection = nameToCollection(news.target.type);
            return collection.find({ _id: new Mongo.ObjectID(news.target.id) }, queryOptions);
          }
        },
      }, /* ,      {
        find(news) {
          if (news.target && news.target.type && news.target.id) {
            return Documents.find({
              id: news.target.id,
              contentKey: 'profil',
            }, { sort: { created: -1 }, limit: 1 });
          }
        },
      } */
      {
        find(news) {
          const queryOptions = {};
          if (news.object && news.object.type === 'actions') {
            queryOptions.fields = {
              _id: 1,
              name: 1,
              idParentRoom: 1,
              profilThumbImageUrl: 1,
            };
          } else if (news.object && news.object.type === 'proposals') {
            queryOptions.fields = {
              _id: 1,
              title: 1,
              idParentRoom: 1,
              profilThumbImageUrl: 1,
            };
          } else {
            queryOptions.fields = {
              _id: 1,
              name: 1,
              profilThumbImageUrl: 1,
            };
          }
          if (news.object && news.object.type && news.object.id) {
            const collection = nameToCollection(news.object.type);
            return collection.find({ _id: new Mongo.ObjectID(news.object.id) }, queryOptions);
          }
        },
      }, /* ,
      {
        find(news) {
          if (news.object && news.object.type && news.object.id) {
            return Documents.find({
              id: news.object.id,
              contentKey: 'profil',
            }, { sort: { created: -1 }, limit: 1 });
          }
        },
      }, */
    ],
  };
});

Meteor.publishComposite('newsDetail', function(scope, scopeId, newsId) {
  check(newsId, String);
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }

  return {
    find() {
      const query = {};
      if (scope === 'citoyens') {
        if (this.userId === scopeId) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'projects') {
        const collection = nameToCollection(scope);
        if (collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isContributors(this.userId)) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'organizations') {
        const collection = nameToCollection(scope);
        if (collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isMembers(this.userId)) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'events') {
        query['scope.type'] = { $in: ['restricted', 'public'] };
      }
      query._id = new Mongo.ObjectID(newsId);
      // console.log(query);
      // console.log(News.find(query).fetch())
      return News.find(query);
    },
    children: [
      {
        find(news) {
          return Citoyens.find({
            _id: new Mongo.ObjectID(news.author),
          }, {
            fields: {
              name: 1,
              profilThumbImageUrl: 1,
            },
          });
        }, /* ,
        children: [
          {
            find(citoyen) {
              return citoyen.documents();
            },
          },
        ], */
      },
      {
        find(news) {
          return news.photoNewsAlbums();
        },
      },
      {
        find(news) {
          const queryOptions = { fields: {
            _id: 1,
            name: 1,
            profilThumbImageUrl: 1,
          } };
          if (news.target && news.target.type && news.target.id) {
            const collection = nameToCollection(news.target.type);
            return collection.find({ _id: new Mongo.ObjectID(news.target.id) }, queryOptions);
          }
        },
      }, /*
      {
        find(news) {
          if (news.target && news.target.type && news.target.id) {
            return Documents.find({
              id: news.target.id,
              contentKey: 'profil',
            }, { sort: { created: -1 }, limit: 1 });
          }
        },
      }, */
      {
        find(news) {
          const queryOptions = {};
          if (news.object && news.object.type === 'actions') {
            queryOptions.fields = {
              _id: 1,
              name: 1,
              idParentRoom: 1,
              profilThumbImageUrl: 1,
            };
          } else if (news.object && news.object.type === 'proposals') {
            queryOptions.fields = {
              _id: 1,
              title: 1,
              idParentRoom: 1,
              profilThumbImageUrl: 1,
            };
          } else {
            queryOptions.fields = {
              _id: 1,
              name: 1,
              profilThumbImageUrl: 1,
            };
          }
          if (news.object && news.object.type && news.object.id) {
            const collection = nameToCollection(news.object.type);
            return collection.find({ _id: new Mongo.ObjectID(news.object.id) }, queryOptions);
          }
        },
      }, /* ,
      {
        find(news) {
          if (news.object && news.object.type && news.object.id) {
            return Documents.find({
              id: news.object.id,
              contentKey: 'profil',
            }, { sort: { created: -1 }, limit: 1 });
          }
        },
      }, */
    ],
  };
});

Meteor.publishComposite('newsDetailComments', function(scope, scopeId, newsId) {
  check(newsId, String);
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }

  return {
    find() {
      const query = {};
      if (scope === 'citoyens') {
        if (this.userId === scopeId) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'projects') {
        const collection = nameToCollection(scope);
        if (collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isContributors(this.userId)) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'organizations') {
        const collection = nameToCollection(scope);
        if (collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isMembers(this.userId)) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'events') {
        query['scope.type'] = { $in: ['restricted', 'public'] };
      }
      query._id = new Mongo.ObjectID(newsId);
      return News.find(query);
    },
    children: [
      {
        find(news) {
          return Citoyens.find({
            _id: new Mongo.ObjectID(news.author),
          }, {
            fields: {
              name: 1,
              profilThumbImageUrl: 1,
            },
          });
        }, /* ,
        children: [
          {
            find(citoyen) {
              return citoyen.documents();
            },
          },
        ], */
      },
      {
        find(news) {
          return Comments.find({
            contextId: news._id._str,
          });
        },
        children: [
          {
            find(comment) {
              return Citoyens.find({
                _id: new Mongo.ObjectID(comment.author),
              }, {
                fields: {
                  name: 1,
                  profilThumbImageUrl: 1,
                },
              });
            }, /* ,
            children: [
              {
                find(citoyen) {
                  return citoyen.documents();
                },
              },
            ], */
          },
        ],
      },
      {
        find(news) {
          return news.photoNewsAlbums();
        },
      },
    ],
  };
});

Meteor.publish('citoyenOnlineProx', function(latlng, radius) {
  check(latlng, { longitude: Number, latitude: Number });
  check(radius, Number);
  if (!this.userId) {
    return null;
  }
  // moulinette pour mettre à jour les Point pour que l'index soit bon
  /*
                                      Citoyens.find({}).fetch().map(function(c){
                                      if(c.geo && c.geo.longitude){
                                      Citoyens.update({_id:c._id}, {$set: {'geoPosition': {
                                      type: "Point",
                                      'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
                                    }}});
                                  }
                                }); */

  return Citoyens.find({ geoPosition: {
    $nearSphere: {
      $geometry: {
        type: 'Point',
        coordinates: [latlng.longitude, latlng.latitude],
      },
      $maxDistance: radius,
    } } }, { _disableOplog: true, fields: { pwd: 0 } });
});


Meteor.publish('users', function() {
  if (!this.userId) {
    return null;
  }
  return [
    Meteor.users.find({ 'status.online': true }, { fields: { status: 1, profile: 1, username: 1 } }),
    Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, { fields: { pwd: 0 } }),
  ];
});

Meteor.publishComposite('callUsers', function() {
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, {
        fields: {
          _id: 1,
          name: 1,
          'links.follows': 1,
          'links.followers': 1,
          profilThumbImageUrl: 1,
        },
      });
    },
    children: [
      {
        find(citoyen) {
          return citoyen.listFriends();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  status: 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publish('thing', function(limit, boardId) {
  check(limit, Number);
  check(boardId, Match.Maybe(String));
  const query = {};
  if (boardId) {
    query.boardId = boardId;
  }
  return Thing.find(query, { sort: { modified: -1 }, limit });
});
