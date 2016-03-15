Template.settings.events({
  "change #radius": function(e, t) {
    var value = parseInt(t.find('#radius').value);
    Session.set('radius',  value);
    return;
  },
  'click #clear': function(event) {
    Meteor.call('clear');
    return;
  },
  'click #geolocate': function(e, t) {
    if(t.find('#geolocate').checked){
      Session.set('geolocate', true);
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
