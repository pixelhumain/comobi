Meteor.startup(function () {

  if (Meteor.isCordova) {
    //contacts
    //window.contacts = navigator.contacts;
    //window.alert = navigator.notification.alert;
    //window.confirm = navigator.notification.confirm;
  }

/*  if (Meteor.isCordova) {
  var options = new ContactFindOptions();
  options.filter = "";
  options.multiple = true;
  var fields = ["displayName", "name"];
  var contacts = window.contacts.find(fields, onSuccess, onError, options);

  function onSuccess(contacts) {
    alert(JSON.stringify(contacts[0]));
    alert(contacts.length + 'contacts'+ contacts[0].displayName);
    for (var i = 0; i < contacts.length; i++) {
      console.log("Display Name = " + contacts[i].displayName);
    }
  }

  function onError(contactError) {
    //alert("error");
    console.log('onError!');
  }
}
*/

  Session.setDefault('GPSstart', false);

  let language = window.navigator.userLanguage || window.navigator.language;
  if (language.indexOf('-') !== -1)
  language = language.split('-')[0];

  if (language.indexOf('_') !== -1)
  language = language.split('_')[0];

  //console.log(language);
  //alert('language: ' + language + '\n');

  Helpers.setLanguage(language);

  TAPi18n.setLanguage(language)
  .done(function () {
    //Session.set("showLoadingIndicator", false);
  })
  .fail(function (error_message) {
    console.log(error_message);
  });

  function success(state) {
    if(state === 'Enabled') {
      console.log("GPS Is Enabled");
      Session.set('GPSstart', true);
      Location.locate(function(pos){
        Session.set('geo',pos);
        console.log(pos);
      }, function(err){
        console.log(err);
        Session.set('GPSstart', false);
        Session.set('geo',null);
      });
    }
  }

  function failure() {
    console.log("Failed to get the GPS State");
    Session.set('GPSstart', false);
  }

  Location.getGPSState(success, failure, {
    dialog: false
  });

  Template.registerHelper('distance',function (coordinates) {
    let geo = Location.getReactivePosition();
    if(geo && geo.latitude){
      let rmetre=geolib.getDistance(
        {latitude: parseFloat(coordinates.latitude), longitude: parseFloat(coordinates.longitude)},
        {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)});
        if(rmetre>1000){
          let rkm=rmetre/1000;
          return 	rkm+' km';
        }else{
          return 	rmetre+' m';
        }
      }else{
        return false;
      }
    });

    Template.registerHelper('equals',
    function(v1, v2) {
      return (v1 === v2);
    }
  );

  Template.registerHelper('langChoix',
  function() {
    return Helpers.language();
  }
);

Template.registerHelper('diffInText',
function(start, end) {
  let a = moment(start);
  let b = moment(end);
  let diffInMs = b.diff(a); // 86400000 milliseconds
  let diffInDays = b.diff(a, 'days'); // 1 day
  let diffInDayText=moment.duration(diffInMs).humanize();
  return diffInDayText;
}
);

Template.registerHelper('isCordova',
   function() {
       return Meteor.isCordova;
   }
);

Template.registerHelper("currentFieldValue", function (fieldName) {
  return AutoForm.getFieldValue(fieldName) || false;
});

Template.registerHelper("Schemas", Schemas);

});

Tracker.autorun(function() {
    if (Meteor.userId() && Meteor.user()) {
        let GPSstart = Session.get('GPSstart');
        if(GPSstart){
Location.startWatching(function(pos){
   console.log("Got a position!", pos);
}, function(err){
   //console.log("Oops! There was an error", err);
});
        }
      }
});

Tracker.autorun(function() {
  if (Reload.isWaitingForResume()) {
    alert("Fermer et ré-ouvrir cette application pour obtenir la nouvelle version!");
    //window.location.reload();
  }
});
