import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

// import sensorApi from '../../api/client/sensors.js';

Meteor.startup(() => {
  if (Meteor.isCordova && !Meteor.isDesktop) {
    if (device.platform === 'Android') {
      //sensorApi.config();
      //sensorApi.disables();

      /*Tracker.autorun((c) => {
        if (Meteor.userId() && Meteor.user()) {
          if (sensorApi.get('watch') === null) {
            const AMBIENT_TEMPERATURE = sensorApi.get('AMBIENT_TEMPERATURE');
            console.log('AMBIENT_TEMPERATURE watch');
            console.log(AMBIENT_TEMPERATURE);
            if (AMBIENT_TEMPERATURE) {
              sensorApi.disable('AMBIENT_TEMPERATURE');
              const RELATIVE_HUMIDITY = sensorApi.get('RELATIVE_HUMIDITY');
              if (RELATIVE_HUMIDITY) {
                sensorApi.disable('RELATIVE_HUMIDITY');
                const PRESSURE = sensorApi.get('PRESSURE');
                if (PRESSURE) {
                  sensorApi.disable('PRESSURE');
                  const LIGHT = sensorApi.get('LIGHT');
                  if (LIGHT) {
                    sensorApi.disable('LIGHT');
                    const PROXIMITY = sensorApi.get('PROXIMITY');
                    if (PROXIMITY) {
                      sensorApi.disable('PROXIMITY');
                      const TEMPERATURE = sensorApi.get('TEMPERATURE');
                      if (TEMPERATURE) {
                        sensorApi.disable('TEMPERATURE');
                        const ACCELEROMETER = sensorApi.get('ACCELEROMETER');
                        if (ACCELEROMETER) {
                          sensorApi.disable('ACCELEROMETER');
                          const GRAVITY = sensorApi.get('GRAVITY');
                          if (GRAVITY) {
                            sensorApi.disable('GRAVITY');
                            const GYROSCOPE = sensorApi.get('GYROSCOPE');
                            if (GYROSCOPE) {
                              sensorApi.disable('GYROSCOPE');
                              const MAGNETIC_FIELD = sensorApi.get('MAGNETIC_FIELD');
                              if (MAGNETIC_FIELD) {
                                sensorApi.disable('MAGNETIC_FIELD');
                                const ROTATION_VECTOR = sensorApi.get('ROTATION_VECTOR');
                                if (ROTATION_VECTOR) {
                                  sensorApi.disable('ROTATION_VECTOR');
                                  const STEP_COUNTER = sensorApi.get('STEP_COUNTER');
                                  if (STEP_COUNTER) {
                                    sensorApi.disable('STEP_COUNTER');

                                    sensorApi.setEnvironmental({
                                      temperature: AMBIENT_TEMPERATURE,
                                      humidity: RELATIVE_HUMIDITY,
                                      pressure: PRESSURE,
                                      light: LIGHT,
                                      timestamp: (new Date()).getTime() });
                                    console.log(JSON.stringify(sensorApi.getEnvironmental()));
                                  // c.stop();
                                  } else {
                                    sensorApi.getState('STEP_COUNTER');
                                  }
                                } else {
                                  sensorApi.getState('ROTATION_VECTOR');
                                }
                              } else {
                                sensorApi.getState('MAGNETIC_FIELD');
                              }
                            } else {
                              sensorApi.getState('GYROSCOPE');
                            }
                          } else {
                            sensorApi.getState('GRAVITY');
                          }
                        } else {
                          sensorApi.getState('ACCELEROMETER');
                        }
                      } else {
                        sensorApi.getState('TEMPERATURE');
                      }
                    } else {
                      sensorApi.getState('PROXIMITY');
                    }
                  } else {
                    sensorApi.getState('LIGHT');
                  }
                } else {
                  sensorApi.getState('PRESSURE');
                }
              } else {
                sensorApi.getState('RELATIVE_HUMIDITY');
              }
            } else {
              sensorApi.getState('AMBIENT_TEMPERATURE');
            }
          }
        }
      });*/
    }
  }
});
