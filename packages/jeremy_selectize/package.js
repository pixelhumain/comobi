Package.describe({
  name: "jeremy:selectize",
  summary: "Selectize is a hybrid of a textbox and <select> element used for tagging, contact lists, and more.",
  version: '0.12.1_5',
  git: 'https://github.com/jshimko/meteor-selectize.git'
});

Package.onUse(function(api) {

  api.versionsFrom("METEOR@0.9.3");

  api.use('jquery', 'client');

  api.addFiles([
    'selectize/dist/css/selectize.default.css',
    'selectize/dist/js/standalone/selectize.js'
  ], ['client']);

});
