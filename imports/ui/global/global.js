import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import i18n from 'meteor/universe:i18n';
import { Router } from 'meteor/iron:router';
import { IonPopup } from 'meteor/meteoric:ionic';

import position from '../../api/client/position.js';

// collections
import { Citoyens } from '../../api/citoyens.js';

import './global.html';

Template.testgeo.onRendered(function() {
  const testgeo = () => {
    const geolocate = position.getGeolocate();
    if (!position.getGPSstart() && geolocate && !position.getReactivePosition()) {
      IonPopup.confirm({ title: i18n.__('Location'),
        template: i18n.__('Use the location of your profile'),
        onOk() {
          if (Citoyens.findOne() && Citoyens.findOne().geo && Citoyens.findOne().geo.latitude) {
            position.setMockLocation(Citoyens.findOne().geo);
            position.setGeolocate(false);
          }
        },
        onCancel() {
          Router.go('changePosition');
        },
        cancelText: i18n.__('no'),
        okText: i18n.__('yes'),
      });
    }
  };

  Meteor.setTimeout(testgeo, '3000');
});

Template.cityTitle.onCreated(function () {
  const self = this;
  self.autorun(function() {
    const latlngObj = position.getLatlngObject();
    if (latlngObj) {
      Meteor.call('getcitiesbylatlng', latlngObj, function(error, result) {
        if (result) {
          // console.log('call city');
          position.setCity(result);
        }
      });
    }
  });
});

Template.cityTitle.helpers({
  city () {
    return position.getCity();
  },
});
