import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/underscore';

import './search.html';

const pageSession = new ReactiveDict('pageSearchGlobal');

Template.searchGlobal.onRendered(function () {
  this.autorun(function() {
    if (pageSession.get('filter')) {
      const query = pageSession.get('filter');
      const querySearch = {};
      if (query.charAt(0) === '#' && query.length > 1) {
        querySearch.name = query;
        querySearch.searchTag = [query.substr(1)];
      } else {
        querySearch.name = query;
      }
      // querySearch['searchTag'] = query;
      // querySearch['locality'] = ;
      querySearch.searchType = ['persons', 'organizations', 'projects', 'events'];
      querySearch.searchBy = 'ALL';
      Meteor.call('searchGlobalautocomplete', querySearch, function(error, result) {
        const array = _.map(result, (arraySearch, key) => ({
          _id: key,
          name: arraySearch.name,
          profilThumbImageUrl: arraySearch.profilThumbImageUrl,
          type: arraySearch.type,
          typeSig: arraySearch.typeSig,
          address: arraySearch.address,
        }));
        // console.log(array);
        if (result) {
          pageSession.set('searchGlobal', array);
        }
      });
    }
  });
});

Template.searchGlobal.helpers({
  searchGlobal () {
    return pageSession.get('searchGlobal');
  },
  countSearchGlobal () {
    return pageSession.get('searchGlobal') && pageSession.get('searchGlobal').length;
  },
  filter () {
    return pageSession.get('filter');
  },
  icone (icone) {
    if (icone === 'citoyens') {
      return { class: 'icon fa fa-user yellow' };
    } else if (icone === 'projects') {
      return { class: 'icon fa fa-lightbulb-o purple' };
    } else if (icone === 'organizations') {
      return { class: 'icon fa fa-users green' };
    } else if (icone === 'city') {
      return { class: 'icon fa fa-university red' };
    }
    return undefined;
  },
  urlType() {
    if (this.typeSig === 'citoyens') {
      return { class: 'icon fa fa-user yellow' };
    } else if (this.typeSig === 'projects') {
      return { class: 'icon fa fa-lightbulb-o purple' };
    } else if (this.typeSig === 'organizations') {
      return { class: 'icon fa fa-users green' };
    } else if (this.typeSig === 'city') {
      return { class: 'icon fa fa-university red' };
    }
    return undefined;
  },
});

Template.searchGlobal.events({
  'keyup #search, change #search': _.throttle((event) => {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('filter', event.currentTarget.value);
    }
  }, 500),
});
