import { Meteor } from 'meteor/meteor';
import { userTest } from './reactive.js';

const userTestClient = {
  config() {
    // userTest.setDefault('', true);

  },
  start() {
    if (Meteor.isCordova && !Meteor.isDesktop) {
    // device
    /*
    {
        "available": true,
        "platform": "Android",
        "version": "9",
        "uuid": "fa38a2bb9e4fa090",
        "cordova": "7.1.4",
        "model": "ONEPLUS A5000",
        "manufacturer": "OnePlus",
        "isVirtual": false,
        "serial": "5c9df2cf"
    }
    */
    }
  },
  status() {
    Tracker.autorun((c) => {
      console.log(Meteor.status());
    });
  },
};

// userTestClient.status();

export { userTestClient as default };
