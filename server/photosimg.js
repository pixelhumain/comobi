FS.debug=true

var S3opt = {
  region: Meteor.settings.aws.region,
  accessKeyId: Meteor.settings.aws.access_key,
  secretAccessKey: Meteor.settings.aws.secret,
  bucket: Meteor.settings.aws.bucket,
  ACL:'public-read'
};

var S3optth = {
  region: Meteor.settings.aws.region,
  accessKeyId: Meteor.settings.aws.access_key,
  secretAccessKey: Meteor.settings.aws.secret,
  bucket: 'pixelphotos.thumb',
  ACL:'public-read',
  transformWrite: function(fileObj, readStream, writeStream) {
          gm(readStream, fileObj.name()).resize('80', '80^').gravity('Top').extent('80','80').stream().pipe(writeStream);
  }
};

var photoStoreLarge = new FS.Store.S3("photosLarge", S3opt);
var photoStoreThumb = new FS.Store.S3("photosThumb", S3optth);


Photosimg = new FS.Collection("photosimg", {
  stores: [photoStoreLarge,photoStoreThumb],
  filter: {
    allow: {
      contentTypes: ['image/*']
    }
  }
});



Photosimg.allow({
  insert:function(userId,project){
    return true;
  },
  update:function(userId,project,fields,modifier){
   return true;
  },
  remove:function(userId,project){
    return true;
  },
  download:function(){
    return true;
  }
});
