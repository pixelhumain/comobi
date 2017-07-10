import { Accounts } from 'meteor/accounts-base';

Meteor.startup(function () {

Meteor.loginAsPixel = function(email,password, callback) {
  var loginRequest = {email: email, pwd: password};
  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
};

Meteor.loginWithPassword  = function(email,password, callback) {
  var loginRequest = {email: email, pwd: password};
  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
};

});
