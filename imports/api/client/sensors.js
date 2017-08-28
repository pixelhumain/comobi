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
  disable() {
    sensors.disableSensor();
  },
  getState(typeSensor) {
    this.disable();
    this.enable(typeSensor);
    sensors.getState((value) => {
      if (value && value[0]) {
        SessionSensors.set(typeSensor, `${value[0]}`);
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
    this.allSensors.map(typeSensor => SessionSensors.set(typeSensor, null));
    this.disable();
  },
};

export { sensorApi as default };
