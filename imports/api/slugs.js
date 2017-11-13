import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const Slugs = new Mongo.Collection('slugs', { idGeneration: 'MONGO' });