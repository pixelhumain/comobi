import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';

import position from '../../api/client/position.js';

// collections
import { Citoyens } from '../../api/citoyens.js';

import './global.html';

Template.testgeo.onRendered(function() {
  const testgeo = () => {
    const geolocate = position.getGeolocate();
    if (!position.getGPSstart() && geolocate && !position.getReactivePosition()) {
      IonPopup.confirm({ title: TAPi18n.__('Location'),
        template: TAPi18n.__('Use the location of your profile'),
        onOk() {
          if (Citoyens.findOne() && Citoyens.findOne().geo && Citoyens.findOne().geo.latitude) {
            position.setMockLocation(Citoyens.findOne().geo);
            position.setGeolocate(false);
          }
        },
        onCancel() {
          Router.go('changePosition');
        },
        cancelText: TAPi18n.__('no'),
        okText: TAPi18n.__('yes'),
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
