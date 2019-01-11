import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { $ } from 'meteor/jquery';

/*
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
    console.log(`watchSensors : ${sensor}`);
    sensorApi.setWatch(true);
    sensorApi.getState(sensor);
  },
  'click .StopWatchSensors'(event, instance) {
    event.preventDefault();
    const sensor = $(event.currentTarget).data('sensor');
    // sensorApi.disables();
    console.log(`StopWatchSensors : ${sensor}`);
    sensorApi.setWatch(true);
    sensorApi.disable(sensor);
  },
});


Template.sensors.helpers({
  getEnvironmental() {
    return sensorApi.getEnvironmental();
  },
  getTemperature() {
    return sensorApi.get('AMBIENT_TEMPERATURE') ? sensorApi.get('AMBIENT_TEMPERATURE') : '0';
  },
  getHumidity() {
    return sensorApi.get('RELATIVE_HUMIDITY') ? sensorApi.get('RELATIVE_HUMIDITY') : '0';
  },
  getPressure() {
    return sensorApi.get('PRESSURE') ? sensorApi.get('PRESSURE') : '0';
  },
  getLight() {
    return sensorApi.get('LIGHT') ? sensorApi.get('LIGHT') : '0';
  },
  getProximity() {
    return sensorApi.get('PROXIMITY') ? sensorApi.get('PROXIMITY') : '0';
  },
  getTemperatureIn() {
    return sensorApi.get('TEMPERATURE') ? sensorApi.get('TEMPERATURE') : '0';
  },
  getAccelerometer() {
    if (sensorApi.get('ACCELEROMETER')) {
      const array = sensorApi.get('ACCELEROMETER').split(',');
      return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
    }
    return 'x:0<br>y:0<br>z:0';
  },
  getGravity() {
    if (sensorApi.get('GRAVITY')) {
      const array = sensorApi.get('GRAVITY').split(',');
      return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
    }
    return 'x:0<br>y:0<br>z:0';
  },
  getGyroscope() {
    if (sensorApi.get('GYROSCOPE')) {
      const array = sensorApi.get('GYROSCOPE').split(',');
      return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
    }
    return 'x:0<br>y:0<br>z:0';
  },
  getMagneticField() {
    if (sensorApi.get('MAGNETIC_FIELD')) {
      const array = sensorApi.get('MAGNETIC_FIELD').split(',');
      return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
    }
    return 'x:0<br>y:0<br>z:0';
  },
  getRotationVector() {
    if (sensorApi.get('ROTATION_VECTOR')) {
      const array = sensorApi.get('ROTATION_VECTOR').split(',');
      return `x:${array[0]}<br>y:${array[1]}<br>z:${array[2]}`;
    }
    return 'x:0<br>y:0<br>z:0';
  },
  getStepCounter() {
    return sensorApi.getStepCounter().toString();
  },
  getTypeSensor(typeSensor) {
    console.log(`getTypeSensor : ${typeSensor}`);
    return sensorApi.getTypeSensorStart(typeSensor);
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
*/
