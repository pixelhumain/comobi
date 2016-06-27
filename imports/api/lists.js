import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Lists = new Meteor.Collection("lists", {idGeneration : 'MONGO'});
