import { Meteor } from 'meteor/meteor';

export const Lists = new Meteor.Collection('lists', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
// Index
  Lists.rawCollection().createIndex(
    { name: 1 },
    { name: 'contextId', partialFilterExpression: { name: { $exists: true } }, background: true }
    , (e) => {
      if (e) {
        // console.log(e);
      }
    });
  Lists.rawCollection().createIndex(
    { list: 'text' },
    { name: 'list_text', background: true }
    , (e) => {
      if (e) {
        // console.log(e);
      }
    });
}
