import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { FS } from 'meteor/cfs:base-package';
import { gm } from "meteor/cfs:graphicsmagick";

if(Meteor.isDevelopment){
FS.debug=true;
}

const S3opt = {
  region: Meteor.settings.aws.region,
  accessKeyId: Meteor.settings.aws.access_key,
  secretAccessKey: Meteor.settings.aws.secret,
  bucket: Meteor.settings.aws.bucket,
  ACL:'public-read'
};

const S3optth = {
  region: Meteor.settings.aws.region,
  accessKeyId: Meteor.settings.aws.access_key,
  secretAccessKey: Meteor.settings.aws.secret,
  bucket: 'pixelphotos.thumb',
  ACL:'public-read',
  transformWrite: function(fileObj, readStream, writeStream) {
          gm(readStream, fileObj.name()).resize('80', '80^').gravity('Top').extent('80','80').stream().pipe(writeStream);
  }
};

const photoStoreLarge = new FS.Store.S3("photosLarge", S3opt);
const photoStoreThumb = new FS.Store.S3("photosThumb", S3optth);

export const Photosimg = new FS.Collection("photosimg", {
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
