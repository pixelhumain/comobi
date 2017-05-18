import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Push } from 'meteor/raix:push';
import { Random } from 'meteor/random';

//submanager
import { listEventsSubs,listOrganizationsSubs,listProjectsSubs,listCitoyensSubs,dashboardSubs } from '../../api/client/subsmanager.js';

import { geoId } from '../../api/client/reactive.js';

import './settings.html';

Template.settings.events({
  "change #radius": function(e, t) {
    let value = parseInt(t.find('#radius').value);
    Session.set('radius',  value);
    //clear cache
    /*listEventsSubs.clear();
    listOrganizationsSubs.clear();
    listProjectsSubs.clear();
    listCitoyensSubs.clear();
    dashboardSubs.clear();*/
    const geoIdRandom = Random.id();
    geoId.set('geoId', geoIdRandom);
    return;
  },
  'click #clear': function(event) {
    Meteor.call('clear');
    return;
  },
  'click #geolocate': function(e, t) {
    if(t.find('#geolocate').checked){
      Session.set('geolocate', true);
      //clear cache
      /*listEventsSubs.clear();
      listOrganizationsSubs.clear();
      listProjectsSubs.clear();
      listCitoyensSubs.clear();
      dashboardSubs.clear();*/
      const geoIdRandom = Random.id();
      geoId.set('geoId', geoIdRandom);
    }else{
      Session.set('geolocate',  false);
    }
    return;
  },
  'click #pushenabled': function(e, t) {
    let state=Push.enabled();
    if(state===false){
      Push.enabled(true);
    }else{
      Push.enabled(false);
    }
    return;
  }
});

Template.settings.helpers({
  isSelected: function (radius,select) {
    return Session.equals("radius", parseInt(select));
  },
  radius: function (select) {
    return Session.get("radius");
  },
  geolocate:function() {
    return Session.get("geolocate");
  },
  pushEnabled:function() {
    let state=Push.enabled();
  return state !== false;
}
});
