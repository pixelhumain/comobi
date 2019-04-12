import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Template } from 'meteor/templating';
import { Helpers } from 'meteor/raix:handlebar-helpers';
import i18n from 'meteor/universe:i18n';
import { moment } from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import '../../../i18n/en.i18n.json';
import '../../../i18n/fr.i18n.json';

import { languageBrowser, userLanguage } from '../../api/helpers.js';

i18n.setOptions({
  open: '__',
  close: '__',
  defaultLocale: 'en',
  sameLocaleOnServerConnection: true,
  // translationsHeaders: {'Cache-Control':'no-cache'},
});

Meteor.startup(() => {
  Tracker.autorun(() => {
    let language;
    if (userLanguage()) {
      // User language is set if no url lang
      language = userLanguage();
    } else {
      language = languageBrowser();
    }
    // console.log(language);
    moment.locale(language);
    Helpers.setLanguage(language);
    i18n.setLocale(language);
    i18n.isLoaded(language);
    console.log(i18n.getLocale());
    console.log(i18n.getLanguages());
  });
  // template helpers
  Template.registerHelper('langChoix', () => Helpers.language());
});


Tracker.autorun((c) => {
  if (Meteor.userId() && Meteor.user() && Meteor.user().profile) {
    const language = languageBrowser();
    // console.log(language);
    Meteor.call('userLocale', { language });
    c.stop();
  }
});
