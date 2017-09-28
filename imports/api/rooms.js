import { Mongo } from 'meteor/mongo';

export const Rooms = new Mongo.Collection('rooms', { idGeneration: 'MONGO' });
