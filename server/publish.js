
Meteor.publish('lists', function() {
	if (!this.userId) {
		return;
	}
	let lists = Lists.find({});
	return lists;
});

Meteor.publish('notificationsUser', function() {
	if (!this.userId) {
		return;
	}
	return NotificationHistory.find({
		'expiration': {
			$gt: new Date()
		},
		'dismissals': {
			$nin: [this.userId]
		}
	}, {
		sort: {
			'addedAt': 1
		}
	});
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
	let lists = Cities.find({cp:cp,country:country});
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


Meteor.publish('citoyenEvents', function(latlng,radius) {
	check(latlng, {latitude:Number,longitude:Number});
	check(radius, Number);
	if (!this.userId) {
		return;
	}
	//selector startDate endDate sort et limit
	var inputDate = new Date();
	//console.log(inputDate);
	return Events.find({'geoPosition': {
		$nearSphere: {
			$geometry: {
				type: "Point",
				coordinates: [latlng.longitude, latlng.latitude]
			},
			$maxDistance: radius
		}}},{_disableOplog: true});
	});


	Meteor.publishComposite('scopeDetail', function(scope,scopeId) {
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
				return collection.find({_id:new Mongo.ObjectID(scopeId)});
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
							'cp': scopeD.address.postalCode
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
							let attendees = _.map(event.links.attendees, function(attendees,key){
								return new Mongo.ObjectID(key);
							});
							return Citoyens.find({
								_id: {$in:attendees}
							}, {
								fields: {
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
							}
						]
					}
				]}
			});

			Meteor.publishComposite('newsList', function(scope,scopeId) {
				check(scopeId, String);
				check(scope, String);
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						var query = {};
						query['scope.'+scope] = {$in:[scopeId]};
						return News.find(query);
					},
					children: [
						{
							find: function(news) {
								/*console.log(news.author);*/
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
								/*console.log(Documents.find({
								id : news._id._str
							}).fetch());*/
							return Documents.find({
								id : news._id._str
							});
						},
						children: [
							{
								find: function(doc) {
									/*console.log(Photosimg.find({
									_id:doc.objId
								}).fetch());*/
								return Photosimg.find({
									_id:doc.objId
								});
							}
						}
					]
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
						/*console.log(Documents.find({
						id : news._id._str
					}).fetch());*/
					return Documents.find({
						id : news._id._str
					});
				},
				children: [
					{
						find: function(doc) {
							/*console.log(Photosimg.find({
							_id:doc.objId
						}).fetch());*/
						return Photosimg.find({
							_id:doc.objId
						});
					}
				}
			]
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
