import { Mongo } from 'meteor/mongo';

export const Thing = new Mongo.Collection('thing', { idGeneration: 'MONGO' });

/*
{
    "_id" : ObjectId("5909bc08dd04523d67a1f9d5"),
    "type" : "smartCitizen",
    "boardId" : "00:06:66:21:89:e9",
    "version" : "1.1-0.9.4",
    "temp" : "28732",
    "hum" : "43336",
    "light" : "34",
    "bat" : "1000",
    "panel" : "0",
    "co" : "2008184",
    "no2" : "121156",
    "noise" : "0",
    "nets" : "4",
    "timestamp" : "2017-05-03 11:16:02",
    "modified" : ISODate("2017-05-03T11:16:24.000Z"),
    "updated" : NumberLong(1493810184),
    "creator" : "587340a6dd0452664d8477ca",
    "created" : NumberLong(1493810184)
}
*/
