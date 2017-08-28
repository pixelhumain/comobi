import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

/* import sensorApi from '../../api/client/sensors.js';

Meteor.startup(() => {
  if (Meteor.isCordova && !Meteor.isDesktop) {
    if (device.platform === 'Android') {
      sensorApi.config();
      sensorApi.disables();

      Tracker.autorun((c) => {
        if (Meteor.userId() && Meteor.user()) {
          const AMBIENT_TEMPERATURE = sensorApi.get('AMBIENT_TEMPERATURE');
          if (AMBIENT_TEMPERATURE) {
            const RELATIVE_HUMIDITY = sensorApi.get('RELATIVE_HUMIDITY');
            if (RELATIVE_HUMIDITY) {
              const PRESSURE = sensorApi.get('PRESSURE');
              if (PRESSURE) {
                const LIGHT = sensorApi.get('LIGHT');
                if (LIGHT) {
                  sensorApi.setEnvironmental({
                    temperature: AMBIENT_TEMPERATURE,
                    humidity: RELATIVE_HUMIDITY,
                    pressure: PRESSURE,
                    light: LIGHT,
                    timestamp: (new Date()).getTime() });
                  console.log(JSON.stringify(sensorApi.getEnvironmental()));
                  // c.stop();
                  sensorApi.disable();
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
      });
    }
  }
});
*/
