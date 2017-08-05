import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

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
  const arrayIdsRetour = _.union(_.flatten(_.map(links, (array, key) => {
    console.log(key);
    return _.map(array, (a, k) => k);
  })));
  console.log(arrayIdsRetour);
  return arrayIdsRetour;
};


export const queryLink = (array, search, selectorga) => {
  const arrayIds = _.map(array, function(array, key) {
    return new Mongo.ObjectID(key);
  });
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
  const arrayIds = _.filter(_.map(array, function(array, key) {
    if (array.toBeValidated === true) {
      return new Mongo.ObjectID(key);
    }
  }), function(array) {
    return array !== undefined;
  });
  return arrayIds;
};

export const queryLinkToBeValidated = (array) => {
  const arrayIds = arrayLinkToBeValidated(array);
  const query = {};
  query._id = { $in: arrayIds };
  return query;
};

export const arrayLinkType = (array, type) => {
  const arrayIds = _.filter(_.map(array, function(array, key) {
    if (array.type === type) {
      return new Mongo.ObjectID(key);
    }
  }), function(array) {
    return array !== undefined;
  });
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

const queryOptions = { sort: { name: 1 },
  fields: {
    _id: 1,
    name: 1,
    links: 1,
    tags: 1,
    profilThumbImageUrl: 1,
  } };

export const searchQuery = (query, search) => {
  if (search.charAt(0) == '#' && search.length > 1) {
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

if (Meteor.isClient) {
  import { Session } from 'meteor/session';
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
    if (Meteor.user()) return Meteor.user().profile.language;
  };

  export const languageBrowser = () => {
    const localeFromBrowser = window.navigator.userLanguage || window.navigator.language;
    let locale = 'en';

    if (localeFromBrowser.match(/en/)) locale = 'en';
    if (localeFromBrowser.match(/fr/)) locale = 'fr';

    return locale;
  };
}
