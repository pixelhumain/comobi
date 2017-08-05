import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Helpers } from 'meteor/raix:handlebar-helpers';
import { TAPi18n } from 'meteor/tap:i18n';
import { moment } from 'meteor/momentjs:moment';

import { languageBrowser, userLanguage } from '../../api/helpers.js';

Meteor.startup(() => {
  Tracker.autorun(() => {
    let language;
    if (userLanguage()) {
      // User language is set if no url lang
      language = userLanguage();
    } else {
      language = languageBrowser();
    }
    moment.locale(language);
    Helpers.setLanguage(language);
    TAPi18n.setLanguage(language)
      .done(() => {
      })
      .fail((errorMessage) => {
        // Handle the situation
        console.log(errorMessage);
      });
  });
  // template helpers
  Template.registerHelper('langChoix', () => Helpers.language());
});


Tracker.autorun(() => {
  if (Meteor.userId() && Meteor.user() && Meteor.user().profile && !Meteor.user().profile.language) {
    language = languageBrowser();
    console.log(language);
    Meteor.call('userLocale', { language });
  }
});
