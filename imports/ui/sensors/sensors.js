import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { $ } from 'meteor/jquery';

import sensorApi from '../../api/client/sensors.js';

import './sensors.html';

import { SessionSensors } from '../../api/client/reactive.js';

Template.sensors.onCreated(function() {
  const template = Template.instance();
  template.ready = new ReactiveVar(true);
});

Template.sensors.events({
  'click .refreshSensors'(event, instance) {
    event.preventDefault();
    sensorApi.disables();
  },
});

Template.sensors.helpers({
  getEnvironmental() {
    return sensorApi.getEnvironmental();
  },
  getTemperature() {
    return sensorApi.get('AMBIENT_TEMPERATURE');
  },
  getHumidity() {
    return sensorApi.get('RELATIVE_HUMIDITY');
  },
  getPressure() {
    return sensorApi.get('PRESSURE');
  },
  getLight() {
    return sensorApi.get('LIGHT');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
