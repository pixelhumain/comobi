import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { moment } from 'meteor/momentjs:moment';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { _ } from 'meteor/underscore';

//collection
//import { NotificationHistory } from '../notification_history.js';
import { ActivityStream } from '../activitystream.js';
import { Citoyens } from '../citoyens.js';
import { News } from '../news.js';
import { Documents } from '../documents.js';
import { Cities } from '../cities.js';
import { Events } from '../events.js';
import { Organizations } from '../organizations.js';
import { Projects } from '../projects.js';
import { Poi } from '../poi.js';
import { Classified } from '../classified.js';
import { Comments } from '../comments.js';
import { Lists } from '../lists.js';
import { Thing } from '../thing.js';

import { nameToCollection, arrayAllLink } from '../helpers.js';

global.Events = Events;
global.Organizations = Organizations;
global.Projects = Projects;
global.Poi = Poi;
global.Classified = Classified;
global.Citoyens = Citoyens;
global.News = News;

Events._ensureIndex({
	"geoPosition": "2dsphere"
});
Projects._ensureIndex({
	"geoPosition": "2dsphere"
});
Poi._ensureIndex({
	"geoPosition": "2dsphere"
});
Classified._ensureIndex({
	"geoPosition": "2dsphere"
});
Organizations._ensureIndex({
	"geoPosition": "2dsphere"
});
Citoyens._ensureIndex({
	"geoPosition": "2dsphere"
});
Cities._ensureIndex({
	"geoShape": "2dsphere"
});
/*collection.rawCollection().createIndex(
{ geoPosition: "2dsphere"},
{ background: true }
, (e) => {
if(e){
	console.log(e)
}
});*/

Meteor.publish('smartcitizenSearch', function(query) {
  const self = this;
  try {
    const response = HTTP.get('https://api.smartcitizen.me/v0/search?q=', {
      params: {
        q: query
      }
    });
//{"id":4123,"type":"Device","name":"Oceatoon 2","description":"reseau de capteur SCK Réunion ","owner_id":579,"owner_username":"oceatoon","city":"La Rivière Saint-Louis","url":"http://api.smartcitizen.me/v0/devices/4123","country_code":"RE","country":"Réunion"}
    _.each(response.data, function(item) {
			if(item.id){
				const response = HTTP.get(item.url);
      const doc = item;

      self.added('smartcitizen', Random.id(), doc);
		}
    });
    self.ready();
  } catch(error) {
    console.log(error);
  }
});

Meteor.publish('globalautocomplete', function(query) {
	check(query,{
	name: String,
	searchType: Array,
	searchBy:String,
	indexMin:Number,
	indexMax:Number
		});

  const self = this;
  try {
    const response = HTTP.post(`${Meteor.settings.endpoint}/communecter/search/globalautocomplete`, {
      params: query
    });

	  _.each(response.data, function(item) {
      const doc = item;
      self.added('search', Random.id(), doc);
    });
    self.ready();
  } catch(error) {
    console.log(error);
  }
});

Meteor.publish('lists', function(name) {
	if (!this.userId) {
		return;
	}
	check(name, String);
	/*countries
	public
	typeIntervention
	listRoomTypes
	eventTypes
	NGOCategories
	localBusinessCategories
	tags*/
	let lists = Lists.find({name:name});
	return lists;
});

Meteor.publish('notificationsUser', function() {
	if (!this.userId) {
		return;
	}
	Counts.publish(this, `notifications.${this.userId}.Unseen`, ActivityStream.api.queryUnseen(this.userId), { noReady: true });
	Counts.publish(this, `notifications.${this.userId}.Unread`, ActivityStream.api.queryUnread(this.userId), { noReady: true });
	return ActivityStream.api.isUnread(this.userId);
});

Meteor.publish('notificationsScope', function(scope,scopeId) {
	check(scopeId, String);
	check(scope, String);
	check(scope, Match.Where(function(name) {
		return _.contains(['events', 'projects','organizations','citoyens'], name);
	}));
	const collection = nameToCollection(scope);
	if (!this.userId) {
		return;
	}
	if(!collection.findOne({_id:new Mongo.ObjectID(scopeId)}).isAdmin(this.userId)){
		return;
	}
		Counts.publish(this, `notifications.${scopeId}.Unseen`, ActivityStream.api.queryUnseen(this.userId,scopeId), { noReady: true });
		Counts.publish(this, `notifications.${scopeId}.Unread`, ActivityStream.api.queryUnread(this.userId,scopeId), { noReady: true });
		Counts.publish(this, `notifications.${scopeId}.UnseenAsk`, ActivityStream.api.queryUnseenAsk(this.userId,scopeId), { noReady: true });
	return collection.findOne({_id:new Mongo.ObjectID(scopeId)}).listNotifications(this.userId);
});

	Meteor.publish('getcitiesbylatlng', function(latlng) {
		check(latlng, {latitude:Number,longitude:Number});
		if (!this.userId) {
			return;
		}

		return Cities.find({"geoShape":
		{$geoIntersects:
			{$geometry:{ "type" : "Point",
			"coordinates" : [ latlng.longitude, latlng.latitude ] }
		}
	}
});
});

Meteor.publish('cities', function(cp,country) {
	if (!this.userId) {
		return;
	}
	check(cp, String);
	check(country, String);
	let lists = Cities.find({'postalCodes.postalCode':cp,country:country});
	return lists;
});

Meteor.publish('organizerEvents', function(organizerType) {
	if (!this.userId) {
		return;
	}
	check(organizerType, String);
	check(organizerType, Match.Where(function(name) {
		return _.contains(['projects','organizations','citoyens'], name);
	}));
	if(organizerType === 'organizations'){
		console.log(Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)}).listOrganizationsCreator().fetch());
		return Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)}).listOrganizationsCreator();
	}else if(organizerType === 'projects'){
		return Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)}).listProjectsCreator();
	}else if(organizerType === 'citoyens'){
		return Citoyens.find({_id:new Mongo.ObjectID(this.userId)},{fields:{_id:1,name:1}})
	}
	return;
});


Meteor.publish('citoyen', function() {
	if (!this.userId) {
		return;
	}
	let objectId = new Mongo.ObjectID(this.userId);
	let citoyen = Citoyens.find({_id:objectId},{fields:{pwd:0}});
	return citoyen;
});


Meteor.publish('geo.dashboard', function(geoId,latlng,radius) {
	const query = {};
	if(radius){
		query['geoPosition'] = {
			$nearSphere: {
				$geometry: {
					type: "Point",
					coordinates: [latlng.longitude, latlng.latitude]
				},
				$maxDistance: radius
			}};
	}else{
		query['geoPosition'] = {
			$geoIntersects: {
				$geometry:{
					"type" : latlng.type,
					"coordinates" : latlng.coordinates
				}
			}
		};
	}
	console.log(geoId);
	Counts.publish(this, `countScopeGeo.${geoId}.events`, Events.find(query));
	Counts.publish(this, `countScopeGeo.${geoId}.organizations`, Organizations.find(query));
	Counts.publish(this, `countScopeGeo.${geoId}.projects`, Projects.find(query));
	Counts.publish(this, `countScopeGeo.${geoId}.poi`, Poi.find(query));
	Counts.publish(this, `countScopeGeo.${geoId}.classified`, Classified.find(query));

	query['_id'] = {$ne: new Mongo.ObjectID(this.userId)};
	Counts.publish(this, `countScopeGeo.${geoId}.citoyens`, Citoyens.find(query));

});


//Geo scope
//scope string collection
//latlng object
//radius string
Meteor.publishComposite('geo.scope', function(scope,latlng,radius) {
	//check(latlng, Object);
	check(scope, String);
	check(scope, Match.Where(function(name) {
		return _.contains(['events', 'projects','poi','classified','organizations','citoyens'], name);
	}));
	const collection = nameToCollection(scope);
	if (!this.userId) {
		return;
	}
	return {
		find: function() {
			const options = {};
			options['_disableOplog'] = true;
			if(scope === 'citoyens'){
				options['fields'] = {pwd:0};
			}
			const query = {};
			if(radius){
				query['geoPosition'] = {
					$nearSphere: {
						$geometry: {
							type: "Point",
							coordinates: [latlng.longitude, latlng.latitude]
						},
						$maxDistance: radius
					}};
			}else{
				query['geoPosition'] = {
					$geoIntersects: {
						$geometry:{
							"type" : latlng.type,
							"coordinates" : latlng.coordinates
						}
					}
				};
			}
			if(scope === 'citoyens'){
				query['_id'] = {$ne: new Mongo.ObjectID(this.userId)};
			}

				Counts.publish(this, `countScopeGeo.${scope}`, collection.find(query), { noReady: true });
				return collection.find(query,options);
		},
		children: [
			{
				find: function(scopeD) {
					return scopeD.documents();
				}
			},
			{
				find: function(scopeD) {
					if(scope === 'events'){
					if(scopeD.organizerType && scopeD.organizerId && _.contains(['events', 'projects','organizations','citoyens'], scopeD.organizerType)){
					let collectionType = nameToCollection(scopeD.organizerType);
					return collectionType.find({
						_id: new Mongo.ObjectID(scopeD.organizerId)
					}, {
						fields: {
							'name': 1
						}
					});
				}
			} else if(scope === 'projects' || scope === 'poi' || scope === 'classified'){
					if(scopeD.parentType && scopeD.parentId && _.contains(['events', 'projects','poi','classified','organizations','citoyens'], scopeD.parentType)){
					let collectionType = nameToCollection(scopeD.parentType);
					return collectionType.find({
						_id: new Mongo.ObjectID(scopeD.parentId)
					}, {
						fields: {
							'name': 1
						}
					});
				}
				}
				}
			}
		]}
	});




	Meteor.publishComposite('scopeDetail', function(scope,scopeId) {
		check(scopeId, String);
		check(scope, String);
		check(scope, Match.Where(function(name) {
			return _.contains(['events', 'projects','poi','classified','organizations','citoyens'], name);
		}));
		let collection = nameToCollection(scope);
		if (!this.userId) {
			return;
		}
		return {
			find: function() {
				const options = {};
				//options['_disableOplog'] = true;
				if(scope === 'citoyens'){
					options['fields'] = {pwd:0};
				}
				//
				if(scope === 'events'){
					Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
				}
				return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
			},
			children: [
				{
					find: function(scopeD) {
						if(scope === 'events'){
						return scopeD.listEventTypes();
					} else if(scope === 'organizations'){
						return scopeD.listOrganisationTypes();
					}
					}
				},
				{
					find: function(scopeD) {
						return Citoyens.find({
							_id: new Mongo.ObjectID(scopeD.creator)
						}, {
							fields: {
								'name': 1
							}
						});
					}
				},
				{
					find: function(scopeD) {
						if(scope !== 'citoyens'){
						return Citoyens.find({
							_id: new Mongo.ObjectID(this.userId)
						}, {
							fields: {
								'name': 1,
								'links': 1,
								'collections': 1
							}
						});
					}
				}
				},
				{
					find: function(scopeD) {
						if(scope === 'events'){
						if(scopeD.organizerType && scopeD.organizerId && _.contains(['events', 'projects','organizations','citoyens'], scopeD.organizerType)){
						let collectionType = nameToCollection(scopeD.organizerType);
						return collectionType.find({
							_id: new Mongo.ObjectID(scopeD.organizerId)
						}, {
							fields: {
								'name': 1,
								'links': 1
							}
						});
					}
				} else if(scope === 'projects' || scope === 'poi' || scope === 'classified'){
						if(scopeD.parentType && scopeD.parentId && _.contains(['events', 'projects','poi','organizations','citoyens'], scopeD.parentType)){
						let collectionType = nameToCollection(scopeD.parentType);
						return collectionType.find({
							_id: new Mongo.ObjectID(scopeD.parentId)
						}, {
							fields: {
								'name': 1,
								'links': 1
							}
						});
					}
				}
					}
				},
				{
					find: function(scopeD) {
						if(scopeD && scopeD.address && scopeD.address.postalCode){
							return Cities.find({
								'postalCodes.postalCode': scopeD.address.postalCode
							});
						}
					}
				},
				{
					find: function(scopeD) {
						return scopeD.documents();
					}
				}
			]}
		});

		Meteor.publishComposite('citoyenActusList', function(limit) {
			if (!this.userId) {
				return;
			}
			return {
				find: function() {
					const options = {};
					//options['_disableOplog'] = true;
					return Citoyens.find({_id:new Mongo.ObjectID(this.userId)},options);
				},
				children: [
					{
						find: function(scopeD) {
							if(scopeD && scopeD.address && scopeD.address.postalCode){
								return Cities.find({
									'postalCodes.postalCode': scopeD.address.postalCode
								});
							}
						}
					},
					{
						find: function(scopeD) {
							return scopeD.documents();
						}
					},
					{
						find: function(scopeD) {
							Counts.publish(this, `countActus.${this.userId}`, scopeD.newsActus(this.userId), { noReady: true });
							return scopeD.newsActus(this.userId,limit);
						},
						children: [
							{
								find: function(news) {
									/*////console.log(news.author);*/
									return Citoyens.find({
										_id: new Mongo.ObjectID(news.author)
									}, {
										fields: {
											'name': 1,
											'profilThumbImageUrl': 1
										}
									});
								},
								children: [
									{
										find: function(citoyen) {
											return citoyen.documents();
										}
									}
								]
							},
							{
								find: function(news) {
									return news.photoNewsAlbums();
								}
							},
							{
								find: function(news) {
									const queryOptions = {fields: {
										'_id': 1,
										'name': 1
									}};
										if(news.target && news.target.type && news.target.id){
											const collection = nameToCollection(news.target.type);
											return collection.find({_id:new Mongo.ObjectID(news.target.id)},queryOptions);
										}
								}
							},
							{
								find: function(news) {
										if(news.target && news.target.type && news.target.id){
											return Documents.find({
								        id : news.target.id,
								        contentKey : "profil"
								      },{sort: {"created": -1},limit: 1 });
										}
								}
							},
							{
								find: function(news) {
									const queryOptions = {fields: {
										'_id': 1,
										'name': 1
									}};
										if(news.object && news.object.type && news.object.id){
											const collection = nameToCollection(news.object.type);
											return collection.find({_id:new Mongo.ObjectID(news.object.id)},queryOptions);
										}
								}
							},
							{
								find: function(news) {
										if(news.object && news.object.type && news.object.id){
											return Documents.find({
								        id : news.object.id,
								        contentKey : "profil"
								      },{sort: {"created": -1},limit: 1 });
										}
								}
							}
						]
					}
				]}
			});

			Meteor.publishComposite('collectionsList', function(scope,scopeId,type) {
				check(scopeId, String);
				check(type, String);
				check(scope, String);
				check(scope, Match.Where(function(name) {
					return _.contains(['citoyens'], name);
				}));
				let collection = nameToCollection(scope);
				if (!this.userId) {
					return;
				}
				return {
					find: function() {
						const options = {};
						//options['_disableOplog'] = true;
						if(scope === 'citoyens'){
							options['fields'] = {pwd:0};
						}
						return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
					},
					children: [
						{
							find: function(scopeD) {
								return Lists.find({name:{$in:['eventTypes','organisationTypes']}});
							}
						},
						{
							find: function(scopeD) {
								return scopeD.listCollections(type,'citoyens');
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
						},
						{
							find: function(scopeD) {
								return scopeD.listCollections(type,'organizations');
							},
							children: [
								{
									find: function(scopeD) {
										return scopeD.documents();
									}
								}
							]
						},
						{
							find: function(scopeD) {
								return scopeD.listCollections(type,'projects');
							},
							children: [
								{
									find: function(scopeD) {
										return scopeD.documents();
									}
								}
							]
						},
						{
							find: function(scopeD) {
								return scopeD.listCollections(type,'events');
							},
							children: [
								{
									find: function(scopeD) {
										return scopeD.documents();
									}
								}
							]
						},
						{
							find: function(scopeD) {
								return scopeD.listCollections(type,'poi');
							},
							children: [
								{
									find: function(scopeD) {
										return scopeD.documents();
									}
								}
							]
						},
						{
							find: function(scopeD) {
								return scopeD.listCollections(type,'classified');
							},
							children: [
								{
									find: function(scopeD) {
										return scopeD.documents();
									}
								}
							]
						},
						{
							find: function(scopeD) {
								return scopeD.documents();
							}
						}
					]}
				});

		Meteor.publishComposite('directoryList', function(scope,scopeId) {
			check(scopeId, String);
			check(scope, String);
			check(scope, Match.Where(function(name) {
				return _.contains(['events', 'projects','organizations','citoyens'], name);
			}));
			let collection = nameToCollection(scope);
			if (!this.userId) {
				return;
			}
			return {
				find: function() {
					const options = {};
					//options['_disableOplog'] = true;
					if(scope === 'citoyens'){
						options['fields'] = {pwd:0};
					}
					if(scope === 'events'){
						//Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
					}
					return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
				},
				children: [
					{
						find: function(scopeD) {
							return Lists.find({name:{$in:['eventTypes','organisationTypes']}});
						}
					},
					{
						find: function(scopeD) {
						if(scope === 'citoyens'){
							return scopeD.listFollowers();
						}else if(scope === 'organizations'){
							return scopeD.listFollowers();
						}else if(scope === 'projects'){
							return scopeD.listFollowers();
						}
					},
					children: [
						{
							find: function(scopeD) {
								return scopeD.documents();
							}
						}
					]
					},
					{
						find: function(scopeD) {
						if(scope === 'citoyens'){
							return scopeD.listFollows();
						}else if(scope === 'organizations'){
							return scopeD.listMembers();
						}else if(scope === 'projects'){
							return scopeD.listContributors();
						}
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
					},
					{
						find: function(scopeD) {
						if(scope === 'citoyens'){
							return scopeD.listMemberOf();
						}else if(scope === 'organizations'){
							return scopeD.listMembersOrganizations();
						}
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
					},
					{
						find: function(scopeD) {
							if(scope === 'citoyens' || scope === 'organizations'){
							return scopeD.listProjects();
						}
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
					},
					{
						find: function(scopeD) {
							if(scope === 'citoyens' || scope === 'organizations' || scope === 'projects'){
							return scopeD.listEvents();
						}
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
					},
					{
						find: function(scopeD) {
							return scopeD.documents();
						}
					}
				]}
			});

			Meteor.publishComposite('directoryListEvents', function(scope,scopeId) {
				check(scopeId, String);
				check(scope, String);
				check(scope, Match.Where(function(name) {
					return _.contains(['projects','organizations','citoyens'], name);
				}));
				let collection = nameToCollection(scope);
				if (!this.userId) {
					return;
				}
				return {
					find: function() {
						const options = {};
						//options['_disableOplog'] = true;
						if(scope === 'citoyens'){
							options['fields'] = {pwd:0};
						}
						if(scope === 'events'){
							//Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
						}
						return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
					},
					children: [
						{
							find: function(scopeD) {
								return Lists.find({name:{$in:['eventTypes']}});
							}
						},
						{
							find: function(scopeD) {
								if(scope === 'citoyens' || scope === 'organizations' || scope === 'projects'){
								return scopeD.listEventsCreator();
							}else{
								return;
							}
							},
							children: [
								{
									find: function(scopeD) {
										if(scopeD.organizerType && scopeD.organizerId && _.contains(['citoyens','organizations','projects'], scopeD.organizerType)){
										let collectionType = nameToCollection(scopeD.organizerType);
										return collectionType.find({
											_id: new Mongo.ObjectID(scopeD.organizerId)
										}, {
											fields: {
												'name': 1,
												'links': 1
											}
										});
									}
									}
								},
								{
									find: function(scopeD) {
										return scopeD.documents();
									}
								}
							]
						},
						{
							find: function(scopeD) {
								return scopeD.documents();
							}
						}
					]}
				});

			Meteor.publishComposite('directoryListProjects', function(scope,scopeId) {
				check(scopeId, String);
				check(scope, String);
				check(scope, Match.Where(function(name) {
					return _.contains(['organizations','citoyens'], name);
				}));
				let collection = nameToCollection(scope);
				if (!this.userId) {
					return;
				}
				return {
					find: function() {
						const options = {};
						//options['_disableOplog'] = true;
						if(scope === 'citoyens'){
							options['fields'] = {pwd:0};
						}
						return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
					},
					children: [
						{
							find: function(scopeD) {
								return Lists.find({name:{$in:['organisationTypes']}});
							}
						},
						{
							find: function(scopeD) {
								if(scope === 'citoyens' || scope === 'organizations'){
								return scopeD.listProjectsCreator();
							}
							},
							children: [
								{
									find: function(scopeD) {
										if(scopeD.parentType && scopeD.parentId && _.contains(['organizations'], scopeD.parentType)){
										let collectionType = nameToCollection(scopeD.parentType);
										return collectionType.find({
											_id: new Mongo.ObjectID(scopeD.parentId)
										}, {
											fields: {
												'name': 1,
												'links': 1
											}
										});
									}
									}
								},
								{
									find: function(scopeD) {
										return scopeD.documents();
									}
								}
							]
						},
						{
							find: function(scopeD) {
								return scopeD.documents();
							}
						}
					]}
				});

				Meteor.publishComposite('directoryListPoi', function(scope,scopeId) {
					check(scopeId, String);
					check(scope, String);
					check(scope, Match.Where(function(name) {
						return _.contains(['projects','organizations','citoyens','events'], name);
					}));
					let collection = nameToCollection(scope);
					if (!this.userId) {
						return;
					}
					return {
						find: function() {
							const options = {};
							//options['_disableOplog'] = true;
							if(scope === 'citoyens'){
								options['fields'] = {pwd:0};
							}
							return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
						},
						children: [
							{
								find: function(scopeD) {
									if(scope === 'citoyens' || scope === 'organizations'  || scope === 'projects'  || scope === 'events'){
									return scopeD.listPoiCreator();
								}
								},
								children: [
									{
										find: function(scopeD) {
											if(scopeD.parentType && scopeD.parentId && _.contains(['citoyens','organizations','projects','events'], scopeD.parentType)){
											let collectionType = nameToCollection(scopeD.parentType);
											return collectionType.find({
												_id: new Mongo.ObjectID(scopeD.parentId)
											}, {
												fields: {
													'name': 1,
													'links': 1
												}
											});
										}
										}
									},
									{
										find: function(scopeD) {
											return scopeD.documents();
										}
									}
								]
							},
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]}
					});

					Meteor.publishComposite('directoryListClassified', function(scope,scopeId) {
						check(scopeId, String);
						check(scope, String);
						check(scope, Match.Where(function(name) {
							return _.contains(['projects','organizations','citoyens','events'], name);
						}));
						let collection = nameToCollection(scope);
						if (!this.userId) {
							return;
						}
						return {
							find: function() {
								const options = {};
								//options['_disableOplog'] = true;
								if(scope === 'citoyens'){
									options['fields'] = {pwd:0};
								}
								return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
							},
							children: [
								{
									find: function(scopeD) {
										if(scope === 'citoyens' || scope === 'organizations'  || scope === 'projects'  || scope === 'events'){
										return scopeD.listClassifiedCreator();
									}
									},
									children: [
										{
											find: function(scopeD) {
												if(scopeD.parentType && scopeD.parentId && _.contains(['citoyens','organizations','projects','events'], scopeD.parentType)){
												let collectionType = nameToCollection(scopeD.parentType);
												return collectionType.find({
													_id: new Mongo.ObjectID(scopeD.parentId)
												}, {
													fields: {
														'name': 1,
														'links': 1
													}
												});
											}
											}
										},
										{
											find: function(scopeD) {
												return scopeD.documents();
											}
										}
									]
								},
								{
									find: function(scopeD) {
										return scopeD.documents();
									}
								}
							]}
						});

				Meteor.publishComposite('directoryListOrganizations', function(scope,scopeId) {
					check(scopeId, String);
					check(scope, String);
					check(scope, Match.Where(function(name) {
						return _.contains(['citoyens'], name);
					}));
					let collection = nameToCollection(scope);
					if (!this.userId) {
						return;
					}
					return {
						find: function() {
							const options = {};
							//options['_disableOplog'] = true;
							if(scope === 'citoyens'){
								options['fields'] = {pwd:0};
							}
							return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
						},
						children: [
							{
								find: function(scopeD) {
									return Lists.find({name:{$in:['organisationTypes']}});
								}
							},
							{
								find: function(scopeD) {
									if(scope === 'citoyens'){
									return scopeD.listOrganizationsCreator();
								}
								},
								children: [
									{
										find: function(scopeD) {
											return scopeD.documents();
										}
									}
								]
							},
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]}
					});

		Meteor.publishComposite('listeventSous', function(scopeId) {
			check(scopeId, String);
			if (!this.userId) {
				return;
			}
			return {
				find: function() {
					Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
						return Events.find({parentId:scopeId});
				},
				children: [
					{
						find: function(event) {
							return event.documents();
						}
					}
				]}
			});

		Meteor.publishComposite('listAttendees', function(scopeId) {
			check(scopeId, String);

			if (!this.userId) {
				return;
			}
			return {
				find: function() {
					return Events.find({_id:new Mongo.ObjectID(scopeId)});
				},
				children: [
					{
						find: function(event) {
							return event.listAttendees();
						},
						children: [
							{
								find: function(citoyen) {
									return Meteor.users.find({
										_id: citoyen._id._str
									}, {
										fields: {
											'profile.online': 1
										}
									});
								}
							},
							{
								find: function(citoyen) {
									return citoyen.documents();
								}
							}
						]
					}
				]}
			});

			Meteor.publishComposite('listMembers', function(scopeId) {
				check(scopeId, String);

				if (!this.userId) {
					return;
				}
				return {
					find: function() {
						return Organizations.find({_id:new Mongo.ObjectID(scopeId)});
					},
					children: [
						{
							find: function(organisation) {
								return organisation.listMembers();
							},
							children: [
								{
									find: function(citoyen) {
										return Meteor.users.find({
											_id: citoyen._id._str
										}, {
											fields: {
												'profile.online': 1
											}
										});
									}
								},
								{
									find: function(citoyen) {
										return citoyen.documents();
									}
								}
							]
						}
					]}
				});

				Meteor.publishComposite('listMembersToBeValidated', function(scope,scopeId) {
					check(scopeId, String);
					check(scope, String);
					check(scope, Match.Where(function(name) {
						return _.contains(['organizations','projects'], name);
					}));
					let collection = nameToCollection(scope);
					if (!this.userId) {
						return;
					}
					return {
						find: function() {
							return collection.find({_id:new Mongo.ObjectID(scopeId)});
						},
						children: [
							{
								find: function(organisation) {
									return organisation.listMembersToBeValidated();
								},
								children: [
									{
										find: function(citoyen) {
											return Meteor.users.find({
												_id: citoyen._id._str
											}, {
												fields: {
													'profile.online': 1
												}
											});
										}
									},
									{
										find: function(citoyen) {
											return citoyen.documents();
										}
									}
								]
							}
						]}
					});

				Meteor.publishComposite('listContributors', function(scopeId) {
					check(scopeId, String);

					if (!this.userId) {
						return;
					}
					return {
						find: function() {
							return Projects.find({_id:new Mongo.ObjectID(scopeId)});
						},
						children: [
							{
								find: function(project) {
									return project.listContributors();
								},
								children: [
									{
										find: function(citoyen) {
											return Meteor.users.find({
												_id: citoyen._id._str
											}, {
												fields: {
													'profile.online': 1
												}
											});
										}
									},
									{
										find: function(citoyen) {
											return citoyen.documents();
										}
									}
								]
							}
						]}
					});

					Meteor.publishComposite('listFollows', function(scopeId) {
						check(scopeId, String);

						if (!this.userId) {
							return;
						}
						return {
							find: function() {
								return Citoyens.find({_id:new Mongo.ObjectID(scopeId)}, {
									fields: {
										'_id': 1,
										'name': 1,
										'links.follows': 1
									}
								});
							},
							children: [
								{
									find: function(citoyen) {
										return citoyen.listFollows();
									},
									children: [
										{
											find: function(citoyen) {
												return Meteor.users.find({
													_id: citoyen._id._str
												}, {
													fields: {
														'profile.online': 1
													}
												});
											}
										},
										{
											find: function(citoyen) {
												return citoyen.documents();
											}
										}
									]
								}
							]}
						});

			Meteor.publishComposite('newsList', function(scope,scopeId,limit) {
				check(scopeId, String);
				check(scope, String);
				check(scope, Match.Where(function(name) {
					return _.contains(['events', 'projects','organizations','citoyens'], name);
				}));
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						const collection = nameToCollection(scope);
						Counts.publish(this, `countNews.${scopeId}`, collection.findOne({_id:new Mongo.ObjectID(scopeId)}).newsJournal(scopeId,this.userId), { noReady: true });
						return collection.findOne({_id:new Mongo.ObjectID(scopeId)}).newsJournal(scopeId,this.userId,limit);
					},
					children: [
						{
							find: function(news) {
								/*////console.log(news.author);*/
								return Citoyens.find({
									_id: new Mongo.ObjectID(news.author)
								}, {
									fields: {
										'name': 1,
										'profilThumbImageUrl': 1
									}
								});
							},
							children: [
								{
									find: function(citoyen) {
										return citoyen.documents();
									}
								}
							]
						},
						{
							find: function(news) {
								return news.photoNewsAlbums();
							}
						},
						{
							find: function(news) {
								const queryOptions = {fields: {
									'_id': 1,
									'name': 1
								}};
									if(news.target && news.target.type && news.target.id){
										const collection = nameToCollection(news.target.type);
										return collection.find({_id:new Mongo.ObjectID(news.target.id)},queryOptions);
									}
							}
						},
						{
							find: function(news) {
									if(news.target && news.target.type && news.target.id){
										return Documents.find({
											id : news.target.id,
											contentKey : "profil"
										},{sort: {"created": -1},limit: 1 });
									}
							}
						},
						{
							find: function(news) {
								const queryOptions = {fields: {
									'_id': 1,
									'name': 1
								}};
									if(news.object && news.object.type && news.object.id){
										const collection = nameToCollection(news.object.type);
										return collection.find({_id:new Mongo.ObjectID(news.object.id)},queryOptions);
									}
							}
						},
						{
							find: function(news) {
									if(news.object && news.object.type && news.object.id){
										return Documents.find({
											id : news.object.id,
											contentKey : "profil"
										},{sort: {"created": -1},limit: 1 });
									}
							}
						}
					]
				}
			});

			Meteor.publishComposite('newsDetail', function(scope,scopeId,newsId) {
				check(newsId, String);
				check(scopeId, String);
				check(scope, String);
				check(scope, Match.Where(function(name) {
					return _.contains(['events', 'projects','organizations','citoyens'], name);
				}));
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						var query = {};
						if(scope === 'citoyens'){
							if(this.userId === scopeId){
								query['scope.type'] = {$in:['restricted','private']};
							}else{
								query['scope.type'] = {$in:['restricted']};
							}
						} else if(scope === 'projects'){
							const collection = nameToCollection(scope);
							if (collection.findOne({_id:new Mongo.ObjectID(scopeId)}).isContributors(this.userId)) {
								query['scope.type'] = {$in:['restricted','private','public']};
							}else{
								query['scope.type'] = {$in:['restricted','public']};
							}
						} else if(scope === 'organizations'){
							const collection = nameToCollection(scope);
							if (collection.findOne({_id:new Mongo.ObjectID(scopeId)}).isMembers(this.userId)) {
								query['scope.type'] = {$in:['restricted','private','public']};
							}else{
								query['scope.type'] = {$in:['restricted','public']};
							}
						} else if(scope === 'events'){
								query['scope.type'] = {$in:['restricted']};
						}
						query['_id'] = new Mongo.ObjectID(newsId);
						return News.find(query);
					},
					children: [
						{
							find: function(news) {
								return Citoyens.find({
									_id: new Mongo.ObjectID(news.author)
								}, {
									fields: {
										'name': 1
									}
								});
							},
							children: [
								{
									find: function(citoyen) {
										return citoyen.documents();
									}
								}
							]
						},
						{
							find: function(news) {
								return news.photoNewsAlbums();
							}
						}
					]
				}
			});

			Meteor.publishComposite('newsDetailComments', function(scope,scopeId,newsId) {
				check(newsId, String);
				check(scopeId, String);
				check(scope, String);
				check(scope, Match.Where(function(name) {
					return _.contains(['events', 'projects','organizations','citoyens'], name);
				}));
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						var query = {};
						if(scope === 'citoyens'){
							if(this.userId === scopeId){
								query['scope.type'] = {$in:['restricted','private']};
							}else{
								query['scope.type'] = {$in:['restricted']};
							}
						} else if(scope === 'projects'){
							const collection = nameToCollection(scope);
							if (collection.findOne({_id:new Mongo.ObjectID(scopeId)}).isContributors(this.userId)) {
								query['scope.type'] = {$in:['restricted','private','public']};
							}else{
								query['scope.type'] = {$in:['restricted','public']};
							}
						} else if(scope === 'organizations'){
							const collection = nameToCollection(scope);
							if (collection.findOne({_id:new Mongo.ObjectID(scopeId)}).isMembers(this.userId)) {
								query['scope.type'] = {$in:['restricted','private','public']};
							}else{
								query['scope.type'] = {$in:['restricted','public']};
							}
						} else if(scope === 'events'){
								query['scope.type'] = {$in:['restricted']};
						}
						query['_id'] = new Mongo.ObjectID(newsId);
						return News.find(query);
					},
					children: [
						{
							find: function(news) {
								return Citoyens.find({
									_id: new Mongo.ObjectID(news.author)
								}, {
									fields: {
										'name': 1
									}
								});
							},
							children: [
								{
									find: function(citoyen) {
										return citoyen.documents();
									}
								}
							]
						},
						{
							find: function(news) {
								return Comments.find({
									contextId: news._id._str
								});
							},
							children: [
								{
									find: function(comment) {
										return Citoyens.find({
											_id: new Mongo.ObjectID(comment.author)
										}, {
											fields: {
												'name': 1
											}
										});
									},
									children: [
										{
											find: function(citoyen) {
												return citoyen.documents();
											}
										}
									]
								}
							]
						},
						{
							find: function(news) {
								return news.photoNewsAlbums();
							}
						}
					]
				}
			});

			Meteor.publish('citoyenOnlineProx', function(latlng,radius) {
				check(latlng, {longitude:Number,latitude:Number});
				check(radius, Number);
				if (!this.userId) {
					return;
				}
				//moulinette pour mettre à jour les Point pour que l'index soit bon
				/*
				Citoyens.find({}).fetch().map(function(c){
				if(c.geo && c.geo.longitude){
				Citoyens.update({_id:c._id}, {$set: {'geoPosition': {
				type: "Point",
				'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
			}}});
		}
	});*/

	return Citoyens.find({'geoPosition': {
		$nearSphere: {
			$geometry: {
				type: "Point",
				coordinates: [latlng.longitude, latlng.latitude]
			},
			$maxDistance: radius
		}}},{_disableOplog: true,fields:{pwd:0}});
	});


	Meteor.publish('users', function() {
		if (!this.userId) {
			return;
		}
		return [
			Meteor.users.find({'profile.online': true}, {fields: {'profile': 1,'username': 1}}),
			Citoyens.find({_id:new Mongo.ObjectID(this.userId)},{_disableOplog: true,fields:{pwd:0}})
		];
	});

	Meteor.publish('thing', function(limit,boardId) {
		check(limit, Number);
		check(boardId, Match.Maybe(String));
		const query = {};
		if(boardId){
			query['boardId'] = boardId;
		}
		return Thing.find(query,{sort: {"modified": -1},limit: limit });
	});
