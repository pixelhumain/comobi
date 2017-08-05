import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Random } from 'meteor/random';

import position from '../../api/client/position.js';

import { geoId } from '../../api/client/reactive.js';

import './changeposition.html';

const pageSession = new ReactiveDict('pageChangePosition');

Template.changePosition.onRendered(function () {
  this.autorun(function() {
    if (pageSession.get('filter')) {
      const query = pageSession.get('filter');
      Meteor.call('searchCities', query, function(error, result) {
        // console.log(result);
        if (result) {
          pageSession.set('cities', result);
        }
      });
    }
  });
});

Template.changePosition.helpers({
  cities () {
    return pageSession.get('cities');
  },
  countCities () {
    return pageSession.get('cities') && pageSession.get('cities').length;
  },
  filter () {
    return pageSession.get('filter');
  },
  citie () {
    return Session.get('citie');
  },
});

Template.changePosition.events({
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('filter', event.currentTarget.value);
    }
  },
  'click .city'() {
    const self = this;
    IonPopup.confirm({ title: TAPi18n.__('Location'),
      template: TAPi18n.__('Use the position of this city'),
      onOk() {
        position.setCity(self);
        if (self.geoShape && self.geoShape.coordinates) {
          position.setOldRadius(position.getRadius());
          position.setRadius(false);
        }
        position.setGeolocate(false);
        position.setMockLocation(self.geo);
        const geoIdRandom = Random.id();
        geoId.set('geoId', geoIdRandom);
        Router.go('dashboard');
      },
      cancelText: TAPi18n.__('no'),
      okText: TAPi18n.__('yes'),
    });
  },
});
