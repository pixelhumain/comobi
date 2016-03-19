var  pageSession = new ReactiveDict('pageContacts');

Template.contacts.onCreated(function () {
  if(Meteor.isCordova){
    pageSession.set( 'contacts', null );
    pageSession.set( 'contact', null );
    pageSession.set('filter', null );
  }
  });

Template.contacts.onRendered(function () {
  /*  https://www.npmjs.com/package/cordova.plugins.diagnostic#requestruntimepermissions
  http://stackoverflow.com/questions/33827495/cordova-plugin-contacts-on-contact-pick-app-crash-on-android-m
  https://forums.meteor.com/t/contacts-array-from-cordova-function-not-passing-as-helper/4658/4*/
  var aidecontacts = [];
  if(Meteor.isCordova){
    pageSession.set( 'contacts', '' );
    pageSession.set( 'contact', '' );
    pageSession.set('filter', '' );
    function onSuccess(contacts){
      var retour = [];
      let contactsFilter = _.filter(contacts, function(o) {return o.emails!== null; })
      let contactsSortby = _.sortBy(contactsFilter, function(o) { return o.name.givenName; });
      let contactsMap = _.map(contactsSortby, function(o) { return {"id":o.id,"displayName":o.displayName,"emails":o.emails}; });
        pageSession.set( 'contacts', contactsMap );
      };
      function onError(contactError){
        pageSession.set( 'contacts', '' );
      };

      this.autorun(function(c) {
        if(pageSession.get("filter")){
        var options = new ContactFindOptions();
        options.filter = pageSession.get("filter");
        options.multiple = true;
        var fields       = ["displayName", "name", "emails"];
        var contactsFind = navigator.contacts.find(fields, onSuccess, onError, options);
      }
      });
    }else{
      pageSession.set( 'contacts', aidecontacts );
    }
  });

  Template.contacts.helpers({
    contacts: function () {
      return pageSession.get("contacts");
    },
    countContacts: function () {
      return pageSession.get("contacts") && pageSession.get("contacts").length;
    },
    filter: function () {
      return pageSession.get("filter");
    },
  });

  Template.contacts.events({
    'keyup #search, change #search': function(event,template){
      if(event.currentTarget.value.length>3){
        pageSession.set( 'filter', event.currentTarget.value);
      }
    },
    'click .contact': function(event,template){
        pageSession.set( 'contact', _.find(pageSession.get("contacts"),function(o){return o.id==this.id;},this));
    }
  });

  Template._contactsUser.helpers({
    contact: function () {
      return pageSession.get("contact");
    },
    emailsOptions: function () {
      return _.map(this.emails,function (c) {
        return {label: c.value, value: c.value};
      });
    }

  });

  AutoForm.addHooks(['followPerson'], {
    after: {
      method : function(error, result) {
        if (error) {
          console.log("Insert Error:", error);
        } else {
          IonModal.close();
          pageSession.set( 'contact', null );
        }
      }
    },
    onError: function(formType, error) {
      let ref;
      if (error.errorType && error.errorType === 'Meteor.Error') {

      }
    }
  });
