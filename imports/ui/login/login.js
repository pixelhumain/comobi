import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';
import { IonPopup } from 'meteor/meteoric:ionic';

// helpers
import { IsValidEmail } from 'meteor/froatsnook:valid-email';

import { pageSession } from '../../api/client/reactive.js';
import position from '../../api/client/position.js';

import './login.html';

Template.login.onCreated(function () {
  pageSession.set('error', false);
  pageSession.set('loading-logging', false);
});

Template.login.onRendered(function () {
  pageSession.set('error', false);
});

Template.login.events({
  'submit .login-form' (event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    if (!email || !password) {
      pageSession.set('error', 'Not completed all fields');
      return;
    }

    if (!IsValidEmail(email)) {
      pageSession.set('error', 'Email not valid');
      return;
    }
    pageSession.set('loading-logging', true);
    Meteor.loginAsPixel(email, password, (error) => {
      if (!error) {
        Meteor.logoutOtherClients();
        pageSession.set('loading-logging', false);
        pageSession.set('error', null);
        return Router.go('/');
      }
      // console.log(error);
      pageSession.set('loading-logging', false);
      pageSession.set('error', error.reason);
      return null;
    });
  },
});
Template.login.helpers({
  loadingLogging () {
    return pageSession.get('loading-logging');
  },
  error () {
    return pageSession.get('error');
  },
});

Template.login.onCreated(function () {
  pageSession.set('error', false);
  pageSession.set('loading-signup', false);
  pageSession.set('cities', null);
});

Template.signin.onRendered(function () {
  pageSession.set('error', false);
  pageSession.set('cities', null);
  pageSession.set('codepostal', null);
  pageSession.set('cityselect', null);

  const geolocate = position.getGeolocate();
  if (geolocate) {
    IonPopup.confirm({ template: TAPi18n.__('Use your current location'),
      onOk() {
        const geo = position.getLatlng();
        if (geo && geo.latitude) {
          const latlng = { latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude) };

          Meteor.call('getcitiesbylatlng', latlng, function(error, result) {
            if (result) {
              pageSession.set('codepostal', result.postalCodes[0].postalCode);
              pageSession.set('cityselect', result.insee);
              Meteor.call('getcitiesbypostalcode', result.postalCodes[0].postalCode, function(errorPostal, data) {
                if (data) {
                  pageSession.set('cities', data);
                }
              });
            }
          });
        }
      },
      cancelText: TAPi18n.__('no'),
      okText: TAPi18n.__('yes'),
    });
  }
});

Template.signin.events({
  'keyup #codepostal, change #codepostal' (event) {
    if (event.currentTarget.value.length === 5) {
      Meteor.call('getcitiesbypostalcode', event.currentTarget.value, function(error, data) {
        pageSession.set('cities', data);
      });
    } else {
      pageSession.set('cities', null);
    }
  },
  'submit .signup-form' (event) {
    event.preventDefault();
    pageSession.set('error', null);
    const trimInput = val => val.replace(/^\s*|\s*$/g, '');
    let city;
    const email = trimInput(event.target.email.value);
    const username = trimInput(event.target.username.value);
    const password = event.target.password.value;
    const repassword = event.target.repassword.value;
    const name = trimInput(event.target.name.value);
    const codepostal = trimInput(event.target.codepostal.value);
    if (event.target.city && event.target.city.value) {
      city = event.target.city.value;
    }

    if (!email || !password || !repassword || !name || !codepostal || !city || !username) {
      pageSession.set('error', 'Not completed all fields');
      return;
    }

    const isValidCodepostal = (val) => {
      if (val.length === 5) {
        return true;
      }
      pageSession.set('error', 'Postcode must be 5 digits');
      return false;
    };

    const isValidName = (val) => {
      if (val.length >= 6) {
        return true;
      }
      pageSession.set('error', 'Name is Too short');
      return false;
    };

    const isValidUsername = (val) => {
      if (val.length >= 6) {
        return true;
      }
      pageSession.set('error', 'Username is Too short');
      return false;
    };

    const isValidPassword = (val) => {
      if (val.length > 7) {
        return true;
      }
      pageSession.set('error', 'Password is Too short');
      return false;
    };


    if (!isValidName(name)) {
      return;
    }
    if (!isValidUsername(username)) {
      return;
    }
    if (!IsValidEmail(email)) {
      pageSession.set('error', 'Email not valid');
      return;
    }
    if (!isValidPassword(password)) {
      return;
    }
    if (!isValidCodepostal(codepostal)) {
      return;
    }
    if (password !== repassword) {
      pageSession.set('error', 'Not the same password');
      return;
    }

    // verifier
    const user = {};
    user.email = email;
    user.password = password;
    user.name = name;
    user.username = username;
    user.repassword = repassword;
    user.codepostal = codepostal;
    // numero insee
    user.city = city;

    pageSession.set('loading-signup', true);
    pageSession.set('error', null);
    // createUserAccount or createUserAccountRest
    // console.log(user);
    Meteor.call('createUserAccountRest', user, function (error) {
      if (error) {
        pageSession.set('loading-signup', false);
        // console.log(error.error);
        pageSession.set('error', error.error);
      } else {
        Meteor.loginAsPixel(email, password, (err) => {
          if (!err) {
            pageSession.set('loading-signup', false);
            pageSession.set('error', null);
            return Router.go('/');
          }
          pageSession.set('loading-signup', false);
          pageSession.set('error', err.reason);
          return false;
        });
      }
    });
  },
});

Template.signin.helpers({
  loadingLogging () {
    return pageSession.get('loading⁻signup');
  },
  error () {
    return pageSession.get('error');
  },
  city () {
    return pageSession.get('cities');
  },
  citySelected () {
    if (pageSession.get('cityselect') === this.insee) {
      return 'selected';
    }
    return undefined;
  },
  codepostal () {
    return pageSession.get('codepostal');
  },
});
