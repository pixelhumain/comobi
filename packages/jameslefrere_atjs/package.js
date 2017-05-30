Package.describe({
  name: "jameslefrere:atjs",
  summary: "Meteor package for At.js",
  version: "0.0.1",
  git: "https://github.com/JamesLefrere/meteor-atjs"
});

Package.onUse(function(api) {
  api.versionsFrom("1.0");
  api.use("jquery", "client")
  api.use("jameslefrere:caretjs@0.0.1", "client")
  api.addFiles(["At.js/dist/css/jquery.atwho.css", "At.js/dist/js/jquery.atwho.js"], "client");
});
