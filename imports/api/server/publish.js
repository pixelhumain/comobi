import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { moment } from 'meteor/momentjs:moment';
import { Counts } from 'meteor/tmeasday:publish-counts';

//collection
import { NotificationHistory } from '../notification_history.js';
import { Citoyens } from '../citoyens.js';
import { News } from '../news.js';
import { Documents } from '../documents.js';
import { Photosimg } from './photosimg.js';
import { Cities } from '../cities.js';
import { Events } from '../events.js';
import { Lists } from '../lists.js';
import { Orgas } from '../organizations.js';

Meteor.publish('lists', function() {
	if (!this.userId) {
		return;
	}
	let lists = Lists.find({});
	return lists;
});

Meteor.publishComposite('notificationsUser', function() {
	if (!this.userId) {
		return;
	}
	return {
		find: function() {
			return NotificationHistory.find({
				'expiration': {
					$gt: new Date()
				},
				'dismissals': {
					$nin: [this.userId]
				},
				'userId': {
					$in: [this.userId]
				}
			}, {
				sort: {
					'addedAt': 1
				}
			});
		},
		children: [
			{
				find: function(notify) {
					return Citoyens.find({
						_id: new Mongo.ObjectID(notify.author)
					}, {
						fields: {
							'name': 1
						}
					});
				}
			},
			{
				find: function(notify) {
					return News.find({
						_id: new Mongo.ObjectID(notify.newsId)
					}, {
						fields: {
							'likes': 1
						}
					});
				},
				find: function(notify) {
					return Documents.find({
						id : notify.author
					});
				}
			}
		]}
	});



	Meteor.publish('getcitiesbylatlng', function(latlng) {
		check(latlng, {latitude:Number,longitude:Number});
		if (!this.userId) {
			return;
		}
		Cities._ensureIndex({
			"geoShape": "2dsphere"
		});
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

Meteor.publish('citoyen', function() {
	if (!this.userId) {
		return;
	}
	let objectId = new Mongo.ObjectID(this.userId);
	let citoyen = Citoyens.find({_id:objectId},{fields:{pwd:0}});
	return citoyen;
});

Events._ensureIndex({
	"geoPosition": "2dsphere"
});

Meteor.publishComposite('citoyenEvents', function(latlng,radius) {
	//check(latlng, Object);
	if (!this.userId) {
		return;
	}
	return {
		find: function() {
			if(radius){
				return Events.find({'geoPosition': {
					$nearSphere: {
						$geometry: {
							type: "Point",
							coordinates: [latlng.longitude, latlng.latitude]
						},
						$maxDistance: radius
					}}},{_disableOplog: true});
				}else{
					//console.log("polygon");
					return Events.find({"geoPosition": {
						$geoIntersects: {
							$geometry:{
								"type" : "Polygon",
								"coordinates" : latlng
							}
						}
					}
				},{_disableOplog: true});
			}

		},
		children: [
			{
				find: function(event) {
					return Documents.find({
						id : event._id._str,
						contentKey : "profil"
					});
				}
			}
		]}
	});

	Orgas._ensureIndex({
		"geoPosition": "2dsphere"
	});

	Meteor.publishComposite('citoyenOrgas', function(latlng,radius) {
		if (!this.userId) {
			return;
		}
		return {
			find: function() {
				if(radius){
					return Orgas.find({'geoPosition': {
						$nearSphere: {
							$geometry: {
								type: "Point",
								coordinates: [latlng.longitude, latlng.latitude]
							},
							$maxDistance: radius
						}}},{_disableOplog: true});
					}else{
						//console.log("polygon");
						return Orgas.find({"geoPosition": {
							$geoIntersects: {
								$geometry:{
									"type" : "Polygon",
									"coordinates" : latlng
								}
							}
						}
					},{_disableOplog: true});
				}
			},
			children: [
				{
					find: function(orga) {
						return Documents.find({
							id : orga._id._str,
							contentKey : "profil"
						});
					}
				}
			]
		}
	});


	Meteor.publishComposite('scopeDetail', function(scope,scopeId) {
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
				if(scope == "events"){
					return Events.find({_id:new Mongo.ObjectID(scopeId)});
				} else if (scope == "organizations"){
					return Orgas.find({_id:new Mongo.ObjectID(scopeId)});
				}
			},
			children: [
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
						return Cities.find({
							'postalCodes.postalCode': scopeD.address.postalCode
						});
					}
				},
				{
					find: function(scopeD) {
						return Documents.find({
							id : scopeD._id._str,
							contentKey : "profil"
						});
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
							////console.log(event.links.attendees);
							let attendees = _.map(event.links.attendees, function(attendees,key){
								return new Mongo.ObjectID(key);
							});
							return Citoyens.find({
								_id: {$in:attendees}
							}, {
								fields: {
									'_id': 1,
									'name': 1,
									'links': 1
								}
							});
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
									return Documents.find({
										id : citoyen._id._str,
										contentKey : "profil"
									});
								}
							}
						]
					}
				]}
			});

			Meteor.publishComposite('newsList', function(scope,scopeId,limit) {
				check(scopeId, String);
				check(scope, String);
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						var query = {};
						//query['scope.'+scope] = {$in:[scopeId]};
						query['target.id'] = scopeId;
						Counts.publish(this, `countNews.${scopeId}`, News.find(query));
						return News.find(query,{sort: {"created": -1},limit:limit});
					},
					children: [
						{
							find: function(news) {
								/*////console.log(news.author);*/
								return Citoyens.find({
									_id: new Mongo.ObjectID(news.author)
								}, {
									fields: {
										'name': 1
									}
								});
							}
						},
						{
							find: function(news) {
								if(news.media && news.media.content && news.media.content.imageId){
									return Photosimg.find({
										_id:news.media.content.imageId
									});
								}
							}
						}
					]
				}
			});

			Meteor.publishComposite('newsDetail', function(newsId) {
				check(newsId, String);
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						return News.find({_id:new Mongo.ObjectID(newsId)});
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
							}
						},
						{
							find: function(news) {
								if(news.media && news.media.content && news.media.content.imageId){
									return Photosimg.find({
										_id:news.media.content.imageId
									});
								}
							}
						}
					]
				}
			});

			Meteor.publish('photosimg', function() {
				if (!this.userId) {
					return;
				}
				return Photosimg.find();
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
	Citoyens._ensureIndex({
		"geoPosition": "2dsphere"
	});
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
