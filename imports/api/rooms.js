import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { Router } from 'meteor/iron:router';

// schemas
import { baseSchema, SchemasRolesRest } from './schema.js';

import { Proposals } from './proposals.js';
import { Actions } from './actions.js'
import { Resolutions } from './resolutions.js'
import { queryOptions } from './helpers.js';

export const Rooms = new Mongo.Collection('rooms', { idGeneration: 'MONGO' });

export const SchemasRoomsRest = new SimpleSchema([baseSchema.pick(['description', 'name']), SchemasRolesRest.pick(['roles', 'roles.$']), {
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events'],
  },
  status: {
    type: String,
    allowedValues: ['open', 'closed'],
  },
}]);

/* parentId:574db1e540bb4e1e0d2762e6
parentType:organizations
status:open
name:test co
description:test co
roles:Organisateur,Partenaire,Financeur,Président,Sponsor,Directeur,Conférencier,Intervenant
key:room
collection:rooms
id:59ccb9fb40bb4e014f991baf */

Rooms.helpers({
  isVisibleFields (field) {
    /* if(this.isMe()){
        return true;
      }else{
        if(this.isPublicFields(field)){
          return true;
        }else{
          if(this.isFollowersMe() && this.isPrivateFields(field)){
            return true;
          }else{
            return false;
          }
        }
      } */
    return true;
  },
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  scopeVar () {
    return 'rooms';
  },
  scopeEdit () {
    return 'roomsEdit';
  },
  listScope () {
    return 'listRooms';
  },
  listProposals (search) {
    const query = {};
    query.idParentRoom = this._id._str;
    // query.status = { $in: ['amendable', 'tovote'] };
    queryOptions.fields.title = 1;
    queryOptions.fields.idParentRoom = 1;
    queryOptions.fields.parentId = 1;
    queryOptions.fields.parentType = 1;
    queryOptions.fields.status = 1;
    queryOptions.fields.amendementActivated = 1;
    queryOptions.fields.amendementDateEnd = 1;
    queryOptions.fields.voteActivated = 1;
    queryOptions.fields.voteDateEnd = 1;
    queryOptions.fields.majority = 1;
    queryOptions.fields.voteAnonymous = 1;
    queryOptions.fields.voteCanChange = 1;
    delete queryOptions.sort.name;
    queryOptions.sort.title = 1;
    if (Meteor.isClient) {
      if (search) {
        if (search.charAt(0) === '#' && search.length > 1) {
          query.tags = { $regex: search.substr(1), $options: 'i' };
        } else {
          query.title = { $regex: search, $options: 'i' };
        }
      }
    }
    // queryOptions
    return Proposals.find(query);
  },
  listProposalsStatus (status, search) {
    const query = {};
    query.idParentRoom = this._id._str;
    // query.status = { $in: ['amendable', 'tovote'] };
    queryOptions.fields.title = 1;
    queryOptions.fields.idParentRoom = 1;
    queryOptions.fields.parentId = 1;
    queryOptions.fields.parentType = 1;
    queryOptions.fields.status = 1;
    queryOptions.fields.amendementActivated = 1;
    queryOptions.fields.amendementDateEnd = 1;
    queryOptions.fields.voteActivated = 1;
    queryOptions.fields.voteDateEnd = 1;
    queryOptions.fields.majority = 1;
    queryOptions.fields.voteAnonymous = 1;
    queryOptions.fields.voteCanChange = 1;
    delete queryOptions.sort.name;
    queryOptions.sort.title = 1;
    if (Meteor.isClient) {
      if (search) {
        if (search.charAt(0) === '#' && search.length > 1) {
          query.tags = { $regex: search.substr(1), $options: 'i' };
        } else {
          query.title = { $regex: search, $options: 'i' };
        }
      }
      if (status) {
        query.status = status;
      }
    }
    // queryOptions
    return Proposals.find(query);
  },
  countProposals (search) {
    return this.listProposals(search) && this.listProposals(search).count();
  },
  countProposalsStatus (status, search) {
    return this.listProposalsStatus(status, search) && this.listProposalsStatus(status, search).count();
  },
  listActions (search) {
    const query = {};
    query.idParentRoom = this._id._str;
    if (Meteor.isClient) {
      if (search) {
        if (search.charAt(0) === '#' && search.length > 1) {
          query.tags = { $regex: search.substr(1), $options: 'i' };
        } else {
          query.name = { $regex: search, $options: 'i' };
        }
      }
    }
    // queryOptions
    return Actions.find(query);
  },
  listActionsStatus (status, search) {
    const query = {};
    query.idParentRoom = this._id._str;
    if (Meteor.isClient) {
      if (search) {
        if (search.charAt(0) === '#' && search.length > 1) {
          query.name = { $regex: search.substr(1), $options: 'i' };
        } else {
          query.title = { $regex: search, $options: 'i' };
        }
      }
      if (status) {
        query.status = status;
      }
    }
    // queryOptions
    return Actions.find(query);
  },
  countActions (search) {
    return this.listActions(search) && this.listActions(search).count();
  },
  countActionsStatus (status, search) {
    return this.listActionsStatus(status, search) && this.listActionsStatus(status, search).count();
  },
});
