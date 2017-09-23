import { Meteor } from 'meteor/meteor';
import { SessionSensors } from './reactive.js';

const sensorApi = {
  Motion: ['ACCELEROMETER', 'GRAVITY', 'GYROSCOPE', 'ROTATION_VECTOR', 'STEP_COUNTER'],
  Environmental: ['AMBIENT_TEMPERATURE', 'RELATIVE_HUMIDITY', 'PRESSURE', 'LIGHT', 'TEMPERATURE'],
  Position: ['MAGNETIC_FIELD', 'GAME_ROTATION_VECTOR', 'PROXIMITY'],
  // allSensors: [...this.Motion, ...this.Environmental, ...this.Position],
  config() {
    this.setWatch(null);
  },
  allSensors() {
    return [...this.Motion, ...this.Environmental, ...this.Position];
  },
  disable(typeSensor) {
    SessionSensors.set('typeSensor', null);
    const typeSensorStart = {};
    typeSensorStart[typeSensor] = false;
    SessionSensors.set('typeSensorStart', typeSensorStart);
    if (typeSensor === 'STEP_COUNTER') {
      if (SessionSensors.get('stepCounterStart')) {
        SessionSensors.set('stepCounterStart', null);
      }
    }
    sensors.removeSensorListener(typeSensor, 'NORMAL', this.listener, (error) => {
      if (error) console.error('Could not stop listening to sensor');
    });
  },
  listener(event) {
    // console.log(event);
    if (event && event.values) {
      // console.log(event.values);
      // SessionSensors.set(SessionSensors.get('typeSensor'), `${event.values.join(',')}`);
      if (event.sensor === 'STEP_COUNTER') {
        if (!SessionSensors.get('stepCounterStart')) {
          SessionSensors.set('stepCounterStart', event.values[0]);
        }
      }
      SessionSensors.set(event.sensor, `${event.values.join(',')}`);
    }
  },
  getState(typeSensor) {
    SessionSensors.set('typeSensor', typeSensor);
    const typeSensorStart = {};
    typeSensorStart[typeSensor] = true;
    SessionSensors.set('typeSensorStart', typeSensorStart);
    sensors.addSensorListener(typeSensor, 'NORMAL', this.listener, (error) => {
      if (error) {
        console.log(error.message || error);
        console.error('Could not listen to sensor');
        SessionSensors.set(typeSensor, 'na');
        typeSensorStart[typeSensor] = false;
        SessionSensors.set('typeSensorStart', typeSensorStart);
      }
    });
  },
  get(typeSensor) {
    return SessionSensors.get(typeSensor);
  },
  setWatch(value) {
    return SessionSensors.set('watch', value);
  },
  setStepCounterStart(value) {
    return SessionSensors.set('stepCounterStart', value);
  },
  getStepCounterStart() {
    return SessionSensors.get('stepCounterStart');
  },
  getStepCounter() {
    const stepCounterStart = this.getStepCounterStart();
    const stepCounterStartInt = parseInt(stepCounterStart);
    const stepCounter = this.get('STEP_COUNTER');
    const stepCounterInt = parseInt(stepCounter);
    return stepCounterInt - stepCounterStartInt;
  },
  getTypeSensorStart(typeSensor) {
    return SessionSensors.get('typeSensorStart') && SessionSensors.get('typeSensorStart')[typeSensor];
  },
  setEnvironmental(environmental) {
    SessionSensors.set('environmental', environmental);
  },
  getEnvironmental() {
    return SessionSensors.get('environmental');
  },
  disables() {
    const self = this;
    const allSensors = this.allSensors();
    allSensors.map((typeSensor) => {
      SessionSensors.set(typeSensor, null);
      self.disable(typeSensor);
    });
    this.setWatch(null);
  },
};


export { sensorApi as default };
