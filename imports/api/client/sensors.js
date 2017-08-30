import { Meteor } from 'meteor/meteor';
import { SessionSensors } from './reactive.js';

const sensorApi = {
  config() {
    this.Motion = ['ACCELEROMETER', 'GRAVITY', 'GYROSCOPE', 'GYROSCOPE_UNCALIBRATED', 'ROTATION_VECTOR', 'LINEAR_ACCELERATION', 'STEP_COUNTER'];
    this.Environmental = ['AMBIENT_TEMPERATURE', 'RELATIVE_HUMIDITY', 'PRESSURE', 'LIGHT', 'TEMPERATURE'];
    this.Position = ['ORIENTATION', 'MAGNETIC_FIELD', 'MAGNETIC_FIELD_UNCALIBRATED', 'GAME_ROTATION_VECTOR', 'PROXIMITY'];
    this.allSensors = [...this.Motion, ...this.Environmental, ...this.Position];
  },
  enable(typeSensor) {
    console.log(`enable ${typeSensor}`);
    sensors.enableSensor(typeSensor);
  },
  disable(typeSensor) {
    SessionSensors.set('typeSensor', typeSensor);
    sensors.removeSensorListener(typeSensor, 'NORMAL', this.listener, (error) => {
      if (error) console.error('Could not stop listening to sensor');
    });
  },
  listener(event) {
    //console.log(event);
    if (event && event.values) {
      console.log(event.values);
      SessionSensors.set(SessionSensors.get('typeSensor'), `${event.values[0]}`);
    }
  },
  getState(typeSensor) {
    SessionSensors.set('typeSensor', typeSensor);
    sensors.addSensorListener(typeSensor, 'NORMAL', this.listener, (error) => {
      if (error) {
        console.log(error.message || error);
        console.error('Could not listen to sensor');
        SessionSensors.set(typeSensor, 'na');
      }
    });
  },
  get(typeSensor) {
    return SessionSensors.get(typeSensor);
  },
  setEnvironmental(environmental) {
    SessionSensors.set('environmental', environmental);
  },
  getEnvironmental() {
    return SessionSensors.get('environmental');
  },
  disables() {
    const self = this;
    this.Environmental.map((typeSensor) => {
      SessionSensors.set(typeSensor, null);
      self.disable(typeSensor);
    });
  },
};


/* const sensorApi = {
  config() {
    this.Motion = ['ACCELEROMETER', 'GRAVITY', 'GYROSCOPE', 'GYROSCOPE_UNCALIBRATED', 'ROTATION_VECTOR', 'LINEAR_ACCELERATION', 'STEP_COUNTER'];
    this.Environmental = ['AMBIENT_TEMPERATURE', 'RELATIVE_HUMIDITY', 'PRESSURE', 'LIGHT', 'TEMPERATURE'];
    this.Position = ['ORIENTATION', 'MAGNETIC_FIELD', 'MAGNETIC_FIELD_UNCALIBRATED', 'GAME_ROTATION_VECTOR', 'PROXIMITY'];
    this.allSensors = [...this.Motion, ...this.Environmental, ...this.Position];
  },
  enable(typeSensor) {
    console.log(`enable ${typeSensor}`);
    sensors.enableSensor(typeSensor);
  },
  disable() {
    sensors.disableSensor();
  },
  getState(typeSensor) {
    this.disable();
    this.enable(typeSensor);
    const id = Meteor.setInterval(() =>{
      sensors.getState((value) => {
        if (value) {
          SessionSensors.set(typeSensor, `${value[0]}`);
          Meteor.clearInterval(id);
        }
      });
    }, 100)


  },
  get(typeSensor) {
    return SessionSensors.get(typeSensor);
  },
  setEnvironmental(environmental) {
    SessionSensors.set('environmental', environmental);
  },
  getEnvironmental() {
    return SessionSensors.get('environmental');
  },
  disables() {
    this.allSensors.map(typeSensor => SessionSensors.set(typeSensor, null));
    this.disable();
  },
}; */

export { sensorApi as default };
