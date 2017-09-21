import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';

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

export const queryLink = (array, search, selectorga) => {
  const arrayIds = _.map(array, (arrayLink, key) => new Mongo.ObjectID(key));
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
  const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.toBeValidated === true) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined);
  return arrayIds;
};

export const queryLinkToBeValidated = (array) => {
  const arrayIds = arrayLinkToBeValidated(array);
  const query = {};
  query._id = { $in: arrayIds };
  return query;
};

export const arrayLinkIsInviting = (array) => {
  const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined);
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
  const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.isInviting === true) {
      return undefined;
    }
    if (arrayLink.type === type) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined);
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
    /*if (selectorga) {
      query = selectorgaQuery(query, selectorga);
    }*/
  }
  return query;
};

export const arrayLinkType = (array, type) => {
  const arrayIds = _.filter(_.map(array, (arrayLink, key) => {
    if (arrayLink.type === type) {
      return new Mongo.ObjectID(key);
    }
    return undefined;
  }), arrayfilter => arrayfilter !== undefined);
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
    const arrayTags = _.reject(tags, value => matches[value] === null, matches);
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
};
