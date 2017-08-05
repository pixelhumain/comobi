import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Push } from 'meteor/raix:push';
import { Random } from 'meteor/random';

import { geoId } from '../../api/client/reactive.js';

import position from '../../api/client/position.js';

import './settings.html';

Template.settings.events({
  'change #radius'(event, instance) {
    const value = parseInt(instance.find('#radius').value);
    position.setRadius(value);
    position.setOldRadius(value);
    const geoIdRandom = Random.id();
    geoId.set('geoId', geoIdRandom);
  },
  'click #clear'() {
    Meteor.call('clear');
  },
  'click #geolocate'(event, instance) {
    if (instance.find('#geolocate').checked) {
      position.setGeolocate(true);
      position.setRadius(position.getOldRadius());
      position.locateNoFilter();
      const geoIdRandom = Random.id();
      geoId.set('geoId', geoIdRandom);
    } else {
      position.setGeolocate(false);
    }
  },
  'click #pushenabled'() {
    const state = Push.enabled();
    if (state === false) {
      Push.enabled(true);
    } else {
      Push.enabled(false);
    }
  },
});

Template.settings.helpers({
  isSelected (radius, select) {
    return position.equalsRadius(parseInt(select));
  },
  radius () {
    return position.getRadius();
  },
  geolocate() {
    return position.getGeolocate();
  },
  pushEnabled() {
    const state = Push.enabled();
    return state !== false;
  },
});
