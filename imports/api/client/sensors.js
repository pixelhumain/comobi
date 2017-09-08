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
    sensors.removeSensorListener(typeSensor, 'NORMAL', this.listener, (error) => {
      if (error) console.error('Could not stop listening to sensor');
    });
  },
  listener(event) {
    // console.log(event);
    if (event && event.values) {
      console.log(event.values);
      // SessionSensors.set(SessionSensors.get('typeSensor'), `${event.values.join(',')}`);
      SessionSensors.set(event.sensor, `${event.values.join(',')}`);
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
  setWatch(value) {
    return SessionSensors.set('watch', value);
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
