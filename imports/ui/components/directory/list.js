import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';

import './item.js';
import './list.html';

Template.Directory_list.onCreated(function () {
  // console.log(Template.currentData());
  this.autorun(() => {
    new SimpleSchema({
      isConnect: { type: String, optional: true },
      list: { type: Mongo.Cursor },
      person: { type: Boolean, optional: true },
      notButton: { type: Boolean, optional: true },
      scope: { type: String },
      scopeId: { type: String, optional: true },
      scopeCible: { type: String, optional: true },
    }).validate(Template.currentData());
  });
});
