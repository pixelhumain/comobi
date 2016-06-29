import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { Push } from 'meteor/raix:push';
import { moment } from 'meteor/momentjs:moment';

//collection
import { NotificationHistory } from './notification_history.js';
import { Citoyens } from './citoyens.js';
import { News } from './news.js'


function userName() {
  return Meteor.user().username || Meteor.user().profile.pixelhumain.name;
}

Meteor.methods({
  userup: function(geo) {
    check(geo, {longitude:Number,latitude:Number});
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (Citoyens.update({
      _id: new Mongo.ObjectID(this.userId)
    }, {
      $set: {
        'geoPosition': {
          type: "Point",
          'coordinates': [parseFloat(geo.longitude), parseFloat(geo.latitude)]
        }
      }
    })) {
      return true;
    } else {
      return false;
    }
    this.unblock();
  },
  'likePhoto': function(photoId) {
    check(photoId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    let doc={};
    doc.id=photoId;
    doc.collection="news";
    doc.action="voteUp";
    let voteQuery={};
    voteQuery["_id"] = new Mongo.ObjectID(photoId);
    voteQuery['voteUp.'+this.userId]={$exists:true};
    console.log(voteQuery);

console.log(JSON.stringify(News.findOne(voteQuery)));

    if (News.findOne(voteQuery)) {
      doc.unset="true";
      Meteor.call('addAction',doc);

    } else {
      let voteQuery={};
      voteQuery["_id"] = new Mongo.ObjectID(photoId);
      voteQuery['voteDown.'+this.userId]={$exists:true};
      console.log(voteQuery);

      if (News.findOne(voteQuery)) {
        let rem={};
        rem.id=photoId;
        rem.collection="news";
        rem.action="voteDown";
        rem.unset="true";
        Meteor.call('addAction',rem);

      }
      Meteor.call('addAction',doc);

    }
  },
  'dislikePhoto': function(photoId) {
    check(photoId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    let doc={};
    doc.id=photoId;
    doc.collection="news";
    doc.action="voteDown";
    let voteQuery={};
    voteQuery["_id"] = new Mongo.ObjectID(photoId);
    voteQuery['voteDown.'+this.userId]={$exists:true};
    console.log(voteQuery);

    if (News.findOne(voteQuery)) {
      doc.unset="true";
      Meteor.call('addAction',doc);
    } else {

      let voteQuery={};
      voteQuery["_id"] = new Mongo.ObjectID(photoId);
      voteQuery['voteUp.'+this.userId]={$exists:true};
      console.log(voteQuery);

      if (News.findOne(voteQuery)) {
        let rem={};
        rem.id=photoId;
        rem.collection="news";
        rem.action="voteUp";
        rem.unset="true";
        Meteor.call('addAction',rem);
      }
      Meteor.call('addAction',doc);

    }
  }
});