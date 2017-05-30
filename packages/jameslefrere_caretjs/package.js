Package.describe({
  name: "jameslefrere:caretjs",
  summary: "Meteor package for Caret.js",
  version: "0.0.1",
  git: "https://github.com/JamesLefrere/meteor-caretjs"
});

Package.onUse(function(api) {
  api.versionsFrom("1.0");
  api.use("jquery", "client")
  api.addFiles("Caret.js/dist/jquery.caret.js", "client");
});
