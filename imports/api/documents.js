import { Meteor } from 'meteor/meteor';

export const Documents = new Meteor.Collection('documents', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
// Index
  Documents.rawCollection().createIndex(
    { id: 1, contentKey: 1 },
    { name: 'id_contentkey', partialFilterExpression: { id: { $exists: true }, contentKey: { $exists: true } }, background: true }
    , (e) => {
      if (e) {
        // console.log(e);
      }
    });
}
