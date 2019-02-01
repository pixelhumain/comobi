import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';
import { TAPi18n } from 'meteor/tap:i18n';

export const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

export const nameToCollection = (name) => {
  if (Meteor.isClient) {
    // Client
    return window[capitalize(name)];
  }
  // Server
  return global[capitalize(name)];
};

export const encodeString = str => encodeURIComponent(str).replace(/\*/g, '%2A');

export const arrayAllLink = (links) => {
  const arrayIdsRetour = _.union(_.flatten(_.map(links, array => _.map(array, (a, k) => k))));
  return arrayIdsRetour;
};

export const searchQuery = (query, search) => {
  if (search.charAt(0) === '#' && search.length > 1) {
    query.tags = { $regex: search.substr(1), $options: 'i' };
  } else {
    query.name = { $regex: search, $options: 'i' };
  }
  return query;
};

export const selectorgaQuery = (query, selectorga) => {
  if (selectorga) {
    query.type = selectorga;
  }
  return query;
};

export const arrayLinkProper = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true))
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === 'citoyens' && arrayLink.toBeValidated === true) {
      return undefined;
    }
    return new Mongo.ObjectID(key);
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const arrayLinkProperNoObject = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true))
    .map(k => k);
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === 'citoyens' && arrayLink.toBeValidated === true) {
      return undefined;
    }
    return key;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const arrayLinkProperInter = (arraya, arrayb) => {
  const arrayaIds = arrayLinkProperNoObject(arraya);
  const arraybIds = arrayLinkProperNoObject(arrayb);
  const a = new Set(arrayaIds);
  const b = new Set(arraybIds);
  const arrayIdsSet = new Set(
    [...a].filter(x => b.has(x)));
  const arrayIds = [...arrayIdsSet].map(_id => new Mongo.ObjectID(_id));
  return arrayIds;
};

export const queryLinkInter = (arraya, arrayb, search, selectorga) => {
  // const arrayIds = _.map(array, (arrayLink, key) => new Mongo.ObjectID(key));
  const arrayIds = arrayLinkProperInter(arraya, arrayb);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
    if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    }
  }
  return query;
};

export const queryLink = (array, search, selectorga) => {
  // const arrayIds = _.map(array, (arrayLink, key) => new Mongo.ObjectID(key));
  const arrayIds = arrayLinkProper(array);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
    if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    }
  }
  return query;
};

export const arrayLinkToBeValidated = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].toBeValidated === true)
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.toBeValidated === true) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const queryLinkToBeValidated = (array) => {
  const arrayIds = arrayLinkToBeValidated(array);
  const query = {};
  query._id = { $in: arrayIds };
  return query;
};

export const arrayLinkIsInviting = (array) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting === true)
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const queryLinkIsInviting = (array, search) => {
  const arrayIds = arrayLinkIsInviting(array);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
  }
  return query;
};

export const arrayLinkAttendees = (array, type) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting !== true && array[k].type === type)
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === type) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const arrayLinkParent = (array, type) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].type === type)
    .map(k => new Mongo.ObjectID(k));
  return arrayIds;
};

export const arrayParent = (array, arrayType) => {
  const arrayIds = Object.keys(array)
    .filter(k => _.contains(arrayType, array[k].type))
    .map(k => new Mongo.ObjectID(k));
  return arrayIds;
};


export const arrayChildrenParent = (scope, parentAuthorise, scopeParent = null, fields = {
  name: 1,
  links: 1,
  profilThumbImageUrl: 1,
  preferences: 1,
}) => {
  const childrenParent = [];

  if (scope === 'events') {
    // sous events
    const parentEventPush = {
      find(scopeD) {
        // console.log(scopeD);
        if (scopeD.parent) {
          const arrayIdsParent = arrayLinkParent(scopeD.parent, 'events');
          // console.log(arrayIdsParent);
          const collectionType = nameToCollection('events');

          let query = {};
          query.$or = [];
          query.$or.push({
            _id: {
              $in: arrayIdsParent,
            },
            'preferences.private': false,
          });
          query = queryOrPrivatescopeIds(query, 'attendees', arrayIdsParent, Meteor.userId());

          return collectionType.find(query, {
            fields,
          });
        }
      },
    };
    childrenParent.push(parentEventPush);
  }

  parentAuthorise.forEach((parent) => {
    if (scope === 'events') {
      const parentPush = {
        find(scopeD) {
          // console.log(scopeD);
          if (scopeD.organizer) {
            const arrayIdsParent = arrayLinkParent(scopeD.organizer, parent);
            // console.log(arrayIdsParent);
            const collectionType = nameToCollection(parent);
            let query = {};
            if (_.contains(['events', 'projects', 'organizations'], parent)) {
              query.$or = [];
              query.$or.push({
                _id: {
                  $in: arrayIdsParent,
                },
                'preferences.private': false,
              });

              if (parent === 'projects') {
                query = queryOrPrivatescopeIds(query, 'contributors', arrayIdsParent, Meteor.userId());
              } else if (parent === 'organizations') {
                query = queryOrPrivatescopeIds(query, 'members', arrayIdsParent, Meteor.userId());
              } else if (parent === 'events') {
                query = queryOrPrivatescopeIds(query, 'attendees', arrayIdsParent, Meteor.userId());
              }
            } else {
              query._id = {
                _id: {
                  $in: arrayIdsParent,
                },
              };
            }

            return collectionType.find(query, {
              fields,
            });
          }
        },
      };

      childrenParent.push(parentPush);
    } else {
      const parentPush = {
        find(scopeD) {
          // console.log(scopeD);
          if (scopeParent) {
            if (_.contains(scopeParent, scope)) {
              if (scopeD.parent) {
                const arrayIdsParent = arrayLinkParent(scopeD.parent, parent);
                // console.log(arrayIdsParent);
                const collectionType = nameToCollection(parent);
                let query = {};
                if (_.contains(['events', 'projects', 'organizations'], parent)) {
                  query.$or = [];
                  query.$or.push({
                    _id: {
                      $in: arrayIdsParent,
                    },
                    'preferences.private': false,
                  });

                  if (parent === 'projects') {
                    query = queryOrPrivatescopeIds(query, 'contributors', arrayIdsParent, Meteor.userId());
                  } else if (parent === 'organizations') {
                    query = queryOrPrivatescopeIds(query, 'members', arrayIdsParent, Meteor.userId());
                  } else if (parent === 'events') {
                    query = queryOrPrivatescopeIds(query, 'attendees', arrayIdsParent, Meteor.userId());
                  }
                } else {
                  query._id = {
                    _id: {
                      $in: arrayIdsParent,
                    },
                  };
                }
                return collectionType.find(query, {
                  fields,
                });
              }
              if (scopeD.parentType && scopeD.parentId && _.contains(parentAuthorise, scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields,
                });
              }
            }
          } else {
            if (scopeD.parent) {
              const arrayIdsParent = arrayLinkParent(scopeD.parent, parent);
              // console.log(arrayIdsParent);
              const collectionType = nameToCollection(parent);
              let query = {};
              if (_.contains(['events', 'projects', 'organizations'], parent)) {
                query.$or = [];
                query.$or.push({
                  _id: {
                    $in: arrayIdsParent,
                  },
                  'preferences.private': false,
                });

                if (parent === 'projects') {
                  query = queryOrPrivatescopeIds(query, 'contributors', arrayIdsParent, Meteor.userId());
                } else if (parent === 'organizations') {
                  query = queryOrPrivatescopeIds(query, 'members', arrayIdsParent, Meteor.userId());
                } else if (parent === 'events') {
                  query = queryOrPrivatescopeIds(query, 'attendees', arrayIdsParent, Meteor.userId());
                }
              } else {
                query._id = {
                  _id: {
                    $in: arrayIdsParent,
                  },
                };
              }
              return collectionType.find(query, {
                fields,
              });
            }
            if (scopeD.parentType && scopeD.parentId && _.contains(parentAuthorise, scopeD.parentType)) {
              const collectionType = nameToCollection(scopeD.parentType);
              return collectionType.find({
                _id: new Mongo.ObjectID(scopeD.parentId),
              }, {
                fields,
              });
            }
          }
        },
      };
      childrenParent.push(parentPush);
    }
  });

  return childrenParent;
};

export const isAdminArray = (organizerArray, citoyen) => {
  let isAdmin = false;
  if (organizerArray) {
    organizerArray.forEach((parent) => {
      // parent.type
      parent.values.forEach((value) => {
        // value._id
        if (parent.type === 'events' && citoyen.links && citoyen.links.events && citoyen.links.events[value._id._str] && citoyen.links.events[value._id._str].isAdmin) {
          isAdmin = true;
        } else if (parent.type === 'projects' && citoyen.links && citoyen.links.projects && citoyen.links.projects[value._id._str] && citoyen.links.projects[value._id._str].isAdmin) {
          isAdmin = true;
        } else if (parent.type === 'organizations' && citoyen.links && citoyen.links.memberOf && citoyen.links.memberOf[value._id._str] && citoyen.links.memberOf[value._id._str].isAdmin) {
          isAdmin = true;
        }
      });
    });
  }
  return isAdmin;
};

export const arrayOrganizerParent = (arrayParent, parentAuthorise, fields = {
  name: 1,
  links: 1,
  preferences: 1,
}) => {
  const childrenParent = [];
  parentAuthorise.forEach((parent) => {
    const arrayIds = arrayLinkParent(arrayParent, parent);
    const collectionType = nameToCollection(parent);
    const arrayType = collectionType.find({
      _id: {
        $in: arrayIds,
      },
    }, {
      fields,
    }).fetch();
    if (arrayType && arrayType.length > 0) {
      childrenParent.push({
        type: parent,
        values: arrayType,
      });
    }
  });
  return childrenParent;
};

export const queryOrPrivateScopeLinks = (scope, scopeId) => {
  const query = {};
  query.$or = [];
  const queryOrDefault = {};
  queryOrDefault['preferences.private'] = false;
  queryOrDefault[`links.${scope}.${scopeId}`] = { $exists: true };
  // queryOrDefault[`links.contributors.${this._id._str}.toBeValidated`] = { $exists: false };
  // queryOrDefault[`links.contributors.${this._id._str}.isInviting`] = { $exists: false };
  query.$or.push(queryOrDefault);
  const queryOrDefaultVide = {};
  queryOrDefaultVide['preferences.private'] = { $exists: false };
  queryOrDefaultVide[`links.${scope}.${scopeId}`] = { $exists: true };
  // queryOrDefaultVide[`links.contributors.${this._id._str}.toBeValidated`] = { $exists: false };
  // queryOrDefaultVide[`links.contributors.${this._id._str}.isInviting`] = { $exists: false };
  query.$or.push(queryOrDefaultVide);
  // private userId validate
  const queryOrPrivate = {};
  queryOrPrivate['preferences.private'] = true;
  queryOrPrivate[`links.${scope}.${scopeId}`] = { $exists: true };
  queryOrPrivate[`links.${scope}.${scopeId}.toBeValidated`] = { $exists: false };
  queryOrPrivate[`links.${scope}.${scopeId}.isInviting`] = { $exists: false };
  queryOrPrivate[`links.${scope}.${Meteor.userId()}`] = { $exists: true };
  queryOrPrivate[`links.${scope}.${Meteor.userId()}.toBeValidated`] = { $exists: false };
  query.$or.push(queryOrPrivate);
  // private userId IsInviting
  const queryOrPrivateIsInviting = {};
  queryOrPrivateIsInviting['preferences.private'] = true;
  queryOrPrivateIsInviting[`links.${scope}.${scopeId}`] = { $exists: true };
  queryOrPrivateIsInviting[`links.${scope}.${scopeId}.toBeValidated`] = { $exists: false };
  queryOrPrivateIsInviting[`links.${scope}.${scopeId}.isInviting`] = { $exists: false };
  queryOrPrivateIsInviting[`links.${scope}.${Meteor.userId()}`] = { $exists: true };
  queryOrPrivateIsInviting[`links.${scope}.${Meteor.userId()}.isInviting`] = { $exists: true };
  query.$or.push(queryOrPrivateIsInviting);
  return query;
};

export const queryOrPrivateScopeLinksIds = (queryStart, scope) => {
  const query = {};
  query.$or = [];
  const queryOrDefault = { ...queryStart };
  queryOrDefault['preferences.private'] = false;
  query.$or.push(queryOrDefault);
  const queryOrDefaultVide = { ...queryStart };
  queryOrDefaultVide['preferences.private'] = { $exists: false };
  query.$or.push(queryOrDefaultVide);
  // private userId validate
  const queryOrPrivate = { ...queryStart };
  queryOrPrivate['preferences.private'] = true;
  queryOrPrivate[`links.${scope}.${Meteor.userId()}`] = { $exists: true };
  queryOrPrivate[`links.${scope}.${Meteor.userId()}.toBeValidated`] = { $exists: false };
  query.$or.push(queryOrPrivate);
  // private userId IsInviting
  const queryOrPrivateIsInviting = { ...queryStart };
  queryOrPrivateIsInviting['preferences.private'] = true;
  queryOrPrivateIsInviting[`links.${scope}.${Meteor.userId()}`] = { $exists: true };
  queryOrPrivateIsInviting[`links.${scope}.${Meteor.userId()}.isInviting`] = { $exists: true };
  query.$or.push(queryOrPrivateIsInviting);
  // console.log(JSON.stringify(query));
  return query;
};

export const queryOrPrivateScope = (query, scope, scopeId, userId) => {
  const queryOrPrivate = {};
  queryOrPrivate._id = new Mongo.ObjectID(scopeId);
  queryOrPrivate['preferences.private'] = true;
  queryOrPrivate[`links.${scope}.${userId}`] = {
    $exists: true,
  };
  queryOrPrivate[`links.${scope}.${userId}.toBeValidated`] = {
    $exists: false,
  };
  query.$or.push(queryOrPrivate);

  const queryOrPrivateInvite = {};
  queryOrPrivateInvite._id = new Mongo.ObjectID(scopeId);
  queryOrPrivateInvite['preferences.private'] = true;
  queryOrPrivateInvite[`links.${scope}.${userId}`] = {
    $exists: true,
  };
  queryOrPrivateInvite[`links.${scope}.${userId}.isInviting`] = {
    $exists: true,
  };
  query.$or.push(queryOrPrivateInvite);
  return query;
};

export const queryOrPrivatescopeIds = (query, scope, scopeIds, userId) => {
  const queryOrPrivate = {};
  queryOrPrivate._id = { $in: scopeIds };
  queryOrPrivate['preferences.private'] = true;
  queryOrPrivate[`links.${scope}.${userId}`] = {
    $exists: true,
  };
  queryOrPrivate[`links.${scope}.${userId}.toBeValidated`] = {
    $exists: false,
  };
  query.$or.push(queryOrPrivate);

  const queryOrPrivateInvite = {};
  queryOrPrivateInvite._id = { $in: scopeIds };
  queryOrPrivateInvite['preferences.private'] = true;
  queryOrPrivateInvite[`links.${scope}.${userId}`] = {
    $exists: true,
  };
  queryOrPrivateInvite[`links.${scope}.${userId}.isInviting`] = {
    $exists: true,
  };
  query.$or.push(queryOrPrivateInvite);
  return query;
};

export const queryLinkAttendees = (array, search, type) => {
  const arrayIds = arrayLinkAttendees(array, type);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
    /* if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    } */
  }
  return query;
};

export const arrayLinkType = (array, type) => {
  const arrayIds = Object.keys(array)
    .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true) && array[k].type === type)
    .map(k => new Mongo.ObjectID(k));
  /* const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === 'citoyens' && arrayLink.toBeValidated === true) {
      return undefined;
    }
    if (arrayLink.type === type) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined); */
  return arrayIds;
};

export const queryLinkType = (array, search, type, selectorga) => {
  const arrayIds = arrayLinkType(array, type);
  let query = {};
  query._id = { $in: arrayIds };
  if (Meteor.isClient) {
    if (search) {
      query = searchQuery(query, search);
    }
    if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    }
  }
  return query;
};

export const queryOptions = { sort: { name: 1 },
  fields: {
    _id: 1,
    name: 1,
    links: 1,
    parent: 1,
    organizer: 1,
    preferences: 1,
    parentId: 1,
    parentType: 1,
    organizerId: 1,
    organizerType: 1,
    tags: 1,
    type: 1,
    profilThumbImageUrl: 1,
  } };


if (Meteor.isClient) {
  import position from './client/position.js';

  export const queryGeoFilter = (query) => {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      const nearObj = position.getNear();
      query.geoPosition = nearObj.geoPosition;
    } else {
      const city = position.getCity();
      if (city && city.geoShape && city.geoShape.coordinates) {
        query['address.codeInsee'] = city.insee;
      }
    }
    return query;
  };

  export const userLanguage = () => {
  // If the user is logged in, retrieve their saved language
    if (Meteor.user()) {
      return Meteor.user().profile.language;
    }
    return undefined;
  };

  export const languageBrowser = () => {
    const localeFromBrowser = window.navigator.userLanguage || window.navigator.language;
    let locale = 'en';

    if (localeFromBrowser.match(/en/)) locale = 'en';
    if (localeFromBrowser.match(/fr/)) locale = 'fr';

    return locale;
  };
}

export const notifyDisplay = (notify, lang = null) => {
  if (notify) {
    let label = notify.displayName;
    const arrayReplace = {};
    if (notify.displayName && notify.labelArray) {
      label = label.replace(new RegExp(/[\{\}]+/, 'g'), '');
      label = label.replace(new RegExp(' ', 'g'), '_');
      // console.log(`activitystream.notification.${label}`);
      Object.keys(notify.labelArray).forEach((k) => {
        if (k === '{where}') {
          if (Array.isArray(notify.labelArray[k])) {
            const whereString = [];
            notify.labelArray[k].forEach((value) => {
              const labelWhere = value.replace(new RegExp(' ', 'g'), '_');
              const labelWhereIndex = `activitystream.notification.${labelWhere}`;
              const labelWhereI18n = lang ? TAPi18n.__(labelWhereIndex, null, lang) : TAPi18n.__(labelWhereIndex);
              if (labelWhereI18n !== labelWhereIndex) {
                whereString.push(labelWhereI18n);
              } else {
                whereString.push(value);
              }
            });
            arrayReplace.where = whereString.join(' ');
          } else {
            arrayReplace.where = '';
          }
        } else if (k === '{author}') {
          if (Array.isArray(notify.labelArray[k])) {
            arrayReplace.author = notify.labelArray[k].join(',');
          } else {
            arrayReplace.author = '';
          }
        } else if (k === '{mentions}') {
          if (Array.isArray(notify.labelArray[k])) {
            const mentionsString = [];
            notify.labelArray[k].forEach((value) => {
              const labelMentions = value.replace(new RegExp(' ', 'g'), '_');
              const labelMentionsIndex = `activitystream.notification.${labelMentions}`;
              const labelMentionsI18n = lang ? TAPi18n.__(labelMentionsIndex, null, lang) : TAPi18n.__(labelMentionsIndex);
              if (labelMentionsI18n !== labelMentionsIndex) {
                mentionsString.push(labelMentionsI18n);
              } else {
                mentionsString.push(value);
              }
            });
            arrayReplace.mentions = mentionsString.join(' ');
            // arrayReplace.mentions = notify.labelArray[k].join(',');
          } else {
            arrayReplace.mentions = '';
          }
        } else if (k === '{what}') {
          if (Array.isArray(notify.labelArray[k])) {
            arrayReplace.what = notify.labelArray[k].join(',');
          } else {
            arrayReplace.what = '';
          }
        } else if (k === '{who}') {
          if (Array.isArray(notify.labelArray[k])) {
            let whoNumber;
            const whoString = [];
            notify.labelArray[k].forEach((value) => {
              if (Number.isInteger(value)) {
                whoNumber = lang ? TAPi18n.__('activitystream.notification.whoNumber', { count: value }, lang) : TAPi18n.__('activitystream.notification.whoNumber', { count: value });
              } else {
                whoString.push(value);
              }
            });
            if (whoString.length > 1 && whoNumber) {
              arrayReplace.who = `${whoString.join(',')}, ${whoNumber}`;
            } else if (whoString.length === 1 && !whoNumber) {
              arrayReplace.who = `${whoString.join(',')}`;
            } else if (whoString.length === 2 && !whoNumber) {
              arrayReplace.who = whoString.join(` ${TAPi18n.__('activitystream.notification.and')} `);
            }
          } else {
            arrayReplace.who = '';
          }
        }
      });
      // {author} invited {who} to join {where}
      // console.log(arrayReplace);
      return lang ? TAPi18n.__(`activitystream.notification.${label}`, arrayReplace, lang) : TAPi18n.__(`activitystream.notification.${label}`, arrayReplace);
    }
    return label;
  }
  return undefined;
};

export const matchTags = (doc, tags) => {
  // const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
  // const regex = /(?:^|\s)(?:#)([^\s!@#$%^&*()=+./,\[{\]};:'"?><]+)/gm;
  const regex = /(?:#)([^\s!@#$%^&*()=+./,\[{\]};:'"?><]+)/gm;

  const matches = [];
  let match;
  if (doc.shortDescription) {
    while ((match = regex.exec(doc.shortDescription))) {
      matches.push(match[1]);
    }
  }
  if (doc.description) {
    while ((match = regex.exec(doc.description))) {
      matches.push(match[1]);
    }
  }

  if (tags) {
    // const arrayTags = _.reject(tags, value => matches[value] === null, matches);
    const arrayTags = tags.filter(value => matches[value] !== null);
    if (doc.tags) {
      const a = new Set([...doc.tags, ...arrayTags, ...matches]);
      doc.tags = [...a];
      // doc.tags = _.uniq(_.union(doc.tags, arrayTags, matches));
    } else {
      const a = new Set([...arrayTags, ...matches]);
      doc.tags = [...a];
      // doc.tags = _.uniq(_.union(arrayTags, matches));
    }
  } else if (matches.length > 0) {
    if (doc.tags) {
      const a = new Set([...doc.tags, ...matches]);
      doc.tags = [...a];
      // doc.tags = _.uniq(_.union(doc.tags, matches));
    } else {
      const a = new Set(matches);
      doc.tags = [...a];
      // doc.tags = _.uniq(matches);
    }
  }
  return doc;
};
