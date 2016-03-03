let photoStoreLarge = new FS.Store.S3("photosLarge");
let photoStoreThumb = new FS.Store.S3("photosThumb");


Photosimg = new FS.Collection("photosimg", {
  stores: [photoStoreLarge,photoStoreThumb],
  filter: {
    allow: {
      contentTypes: ['image/*']
    }
  }
});
