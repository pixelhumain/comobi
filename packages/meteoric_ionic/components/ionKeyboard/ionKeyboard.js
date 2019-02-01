Meteor.startup(function () {
  if (Meteor.isCordova && Platform.isAndroid()) {
    IonKeyboard.disableScroll();
  }
});

IonKeyboard = {
  close: function () {
    if (Meteor.isCordova && Platform.isAndroid()) {
      cordova.plugins.Keyboard.close();
    }
  },

  show: function () {
    if (Meteor.isCordova && Platform.isAndroid()) {
      cordova.plugins.Keyboard.show();
    }
  },

  hideKeyboardAccessoryBar: function () {
    if (Meteor.isCordova && Platform.isAndroid()) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
  },

  showKeyboardAccessoryBar: function () {
    if (Meteor.isCordova && Platform.isAndroid()) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
  },

  disableScroll: function () {
    if (Meteor.isCordova && Platform.isAndroid()) {
      cordova.plugins.Keyboard.disableScroll(true);
    }
  },

  enableScroll: function () {
    if (Meteor.isCordova && Platform.isAndroid()) {
      cordova.plugins.Keyboard.disableScroll(false);
    }
  }
};

window.addEventListener('native.keyboardshow', function (event) {

  // TODO: Android is having problems
  if (Platform.isAndroid()) {
    return;
  }

  

});

window.addEventListener('native.keyboardhide', function (event) {

  // TODO: Android is having problems
  if (Platform.isAndroid()) {
    return;
  }


});
