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

Template.sensors.onCreated(function() {
  const template = Template.instance();
  template.ready = new ReactiveVar(true);
});

Template.sensors.events({
  'click .refreshSensors'(event, instance) {
    event.preventDefault();
    sensorApi.disables();
  },
  'click .watchSensors'(event, instance) {
    event.preventDefault();
    const sensor = $(event.currentTarget).data('sensor');
    // sensorApi.disables();
    /*if (sensorApi.get('typeSensor') !== null) {
      sensorApi.disable(sensorApi.get('typeSensor'));
    }*/
    sensorApi.setWatch(true);
    sensorApi.getState(sensor);
  },
  'click .StopWatchSensors'(event, instance) {
    event.preventDefault();
    const sensor = $(event.currentTarget).data('sensor');
    // sensorApi.disables();
    sensorApi.setWatch(null);
    sensorApi.disable(sensor);
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
  getProximity() {
    return sensorApi.get('PROXIMITY');
  },
  getTemperatureIn() {
    return sensorApi.get('TEMPERATURE');
  },
  getAccelerometer() {
    const array = sensorApi.get('ACCELEROMETER').split(',');
    return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
  },
  getGravity() {
    const array = sensorApi.get('GRAVITY').split(',');
    return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
  },
  getGyroscope() {
    const array = sensorApi.get('GYROSCOPE').split(',');
    return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
  },
  getMagneticField() {
    const array = sensorApi.get('MAGNETIC_FIELD').split(',');
    return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
  },
  getRotationVector() {
    const array = sensorApi.get('ROTATION_VECTOR').split(',');
    return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
  },
  getStepCounter() {
    return sensorApi.get('STEP_COUNTER');
  },
  getTypeSensor() {
    return sensorApi.get('typeSensor');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
