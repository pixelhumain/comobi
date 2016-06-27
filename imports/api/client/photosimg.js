import { FS } from 'meteor/cfs:base-package';

const photoStoreLarge = new FS.Store.S3("photosLarge");
const photoStoreThumb = new FS.Store.S3("photosThumb");


export const Photosimg = new FS.Collection("photosimg", {
  stores: [photoStoreLarge,photoStoreThumb],
  filter: {
    allow: {
      contentTypes: ['image/*']
    }
  }
});
