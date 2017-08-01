import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Location } from 'meteor/djabatav:geolocation-plus';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { HTTP } from 'meteor/http';
import { Mapbox } from 'meteor/communecter:mapbox';

import { pageSession,geoId } from '../../api/client/reactive.js';
import { position } from '../../api/client/position.js';
import { searchQuery,queryGeoFilter } from '../../api/helpers.js';

import './global.html'

Template.testgeo.onRendered(function() {

  const testgeo = () => {
    let geolocate = Session.get('geolocate');
    //console.log(`${Session.get('GPSstart')} - ${geolocate} - ${position.getReactivePosition()}`);
    if(!Session.get('GPSstart') && geolocate && !position.getReactivePosition()){

      IonPopup.confirm({title:TAPi18n.__('Location'),template:TAPi18n.__('Use the location of your profile'),
      onOk: function(){
        if(Citoyens.findOne() && Citoyens.findOne().geo && Citoyens.findOne().geo.latitude){
          Location.setMockLocation({
            latitude : Citoyens.findOne().geo.latitude,
            longitude : Citoyens.findOne().geo.longitude,
            updatedAt : new Date()
          });
          Session.set('geolocate',  false);
        }
      },
      onCancel: function(){
        Router.go('changePosition');
      },
      cancelText:TAPi18n.__('no'),
      okText:TAPi18n.__('yes')
    });
  }
}

Meteor.setTimeout(testgeo, '3000');
});

Template.cityTitle.onCreated(function () {
  var self = this;
  self.autorun(function(c) {
    const latlngObj = position.getLatlngObject();
    if(latlngObj){
      Meteor.call('getcitiesbylatlng',latlngObj,function(error, result){
        if(result){
          //console.log('call city');
          Session.set('city', result);
        }
      });
    }
  });

});

Template.cityTitle.helpers({
  city (){
    return Session.get('city');
  }
});
