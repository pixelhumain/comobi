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

    if (News.findOne({
      _id: new Mongo.ObjectID(photoId),
      likes: {
        $in: [this.userId]
      }
    })) {
      News.update({
        _id: new Mongo.ObjectID(photoId)
      }, {
        $pull: {
          likes: this.userId
        }
      })
    } else {
      News.update({
        _id: new Mongo.ObjectID(photoId)
      }, {
        $push: {
          likes: this.userId
        }
      });

    }
  }
});
