import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const Cities = new Mongo.Collection('cities', { idGeneration: 'MONGO' });
