function userName() {
  return Meteor.user().username || Meteor.user().profile.pixelhumain.name;
}

Meteor.methods({
  userup: function(geo) {
    check(geo, {longitude:Number,latitude:Number});
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (Citoyen.update({
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
  cfsbase64tos3up: function(photo,str,type,idType) {
    check(photo, Match.Any);
    check(str, Match.Any);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var fsFile = new FS.File();
    fsFile.attachData(photo,{'type':'image/jpeg'});
    fsFile.extension('jpg');
    fsFile.name(str);
    fsFile.metadata = {owner: this.userId,type:type,id:idType};
    fsFile.on('error', function () {

    });
    fsFile.on("uploaded", function () {

    });

    var photoret=Photosimg.insert(fsFile);

    return photoret._id;
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

    if (News.findOne({
      _id: new Mongo.ObjectID(photoId),
      voteUp: {
        $in: [this.userId]
      }
    })) {
      doc.unset="true";
      Meteor.call('addAction',doc);
    } else {

      if (News.findOne({
        _id: new Mongo.ObjectID(photoId),
        voteDown: {
          $in: [this.userId]
        }
      })) {
        Meteor.call('dislikePhoto',photoId);

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

    if (News.findOne({
      _id: new Mongo.ObjectID(photoId),
      voteDown: {
        $in: [this.userId]
      }
    })) {
      doc.unset="true";
      Meteor.call('addAction',doc);
    } else {

      if (News.findOne({
        _id: new Mongo.ObjectID(photoId),
        voteUp: {
          $in: [this.userId]
        }
      })) {
        Meteor.call('likePhoto',photoId);

      }
      Meteor.call('addAction',doc);

    }
  }
});
