import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Cities = new Meteor.Collection("cities", {idGeneration : 'MONGO'});
