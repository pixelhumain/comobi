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
              arrayReplace.who = `${whoString.join(' and ')}`;
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
