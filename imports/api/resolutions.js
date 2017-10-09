import { Mongo } from 'meteor/mongo';

export const Resolutions = new Mongo.Collection('resolutions', { idGeneration: 'MONGO' });

Resolutions.helpers({
  isVisibleFields (field) {
    return true;
  },
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  scopeVar () {
    return 'resolutions';
  },
  scopeEdit () {
    return 'resolutionsEdit';
  },
  listScope () {
    return 'listResolutions';
  },
});
