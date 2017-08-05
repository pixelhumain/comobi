import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './item.html';

Template.scopeItemList.helpers({
  typeI18n(type) {
    return `schemas.poirest.type.options.${type}`;
  },
});
