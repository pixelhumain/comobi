import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { ReactiveDict } from 'meteor/reactive-dict';
import { AutoForm } from 'meteor/aldeed:autoform';
import { IonModal } from 'meteor/meteoric:ionic';

import './contacts.html';

const pageSession = new ReactiveDict('pageContacts');

Template.contacts.onCreated(function () {
  if (Meteor.isCordova) {
    pageSession.set('contacts', null);
    pageSession.set('contact', null);
    pageSession.set('filter', null);
  }
});

Template.contacts.onRendered(function () {
  /*  https://www.npmjs.com/package/cordova.plugins.diagnostic#requestruntimepermissions
  http://stackoverflow.com/questions/33827495/cordova-plugin-contacts-on-contact-pick-app-crash-on-android-m
  https://forums.meteor.com/t/contacts-array-from-cordova-function-not-passing-as-helper/4658/4 */
  const aidecontacts = [];
  if (Meteor.isCordova) {
    pageSession.set('contacts', '');
    pageSession.set('contact', '');
    pageSession.set('filter', '');
    const onSuccess = (contacts) => {
      const contactsFilter = _.filter(contacts, function(o) { return o.emails !== null; });
      const contactsSortby = _.sortBy(contactsFilter, function(o) { return o.name.givenName; });
      const contactsMap = _.map(contactsSortby, function(o) { return { id: o.id, displayName: o.displayName, emails: o.emails }; });
      pageSession.set('contacts', contactsMap);
    };
    const onError = (contactError) => {
      pageSession.set('contacts', '');
    };

    this.autorun(function() {
      if (pageSession.get('filter')) {
        const options = new ContactFindOptions();
        options.filter = pageSession.get('filter');
        options.multiple = true;
        const fields = ['displayName', 'name', 'emails'];
        navigator.contacts.find(fields, onSuccess, onError, options);
      }
    });
  } else {
    pageSession.set('contacts', aidecontacts);
  }
});

Template.contacts.helpers({
  contacts () {
    return pageSession.get('contacts');
  },
  countContacts () {
    return pageSession.get('contacts') && pageSession.get('contacts').length;
  },
  filter () {
    return pageSession.get('filter');
  },
});

Template.contacts.events({
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 3) {
      pageSession.set('filter', event.currentTarget.value);
    }
  },
  'click .contact'() {
    pageSession.set('contact', _.find(pageSession.get('contacts'), function(o) { return o.id === this.id; }, this));
  },
});

Template._contactsUser.helpers({
  contact () {
    return pageSession.get('contact');
  },
  emailsOptions () {
    return _.map(this.emails, function (c) {
      return { label: c.value, value: c.value };
    });
  },

});

AutoForm.addHooks(['followPerson'], {
  after: {
    method(error) {
      if (error) {
        // console.log('Insert Error:', error);
      } else {
        IonModal.close();
        pageSession.set('contact', null);
      }
    },
  },
  onError(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {

    }
  },
});
