
Meteor.publish('lists', function() {
	if (!this.userId) {
		return;
	}
	let lists = Lists.find({});
	//console.log(JSON.stringify(lists.fetch()));
	return lists;
});


Meteor.publish('cities', function(cp,country) {
	if (!this.userId) {
		return;
	}
	console.log(country);
	console.log(cp);
	check(cp, String);
	check(country, String);
	let lists = Cities.find({cp:cp,country:country});
	console.log(JSON.stringify(lists.fetch()));
	return lists;
});

Meteor.publish('citoyen', function() {
	if (!this.userId) {
		return;
	}
	let objectId = new Mongo.ObjectID(this.userId);
	let citoyen = Citoyens.find({_id:objectId},{fields:{pwd:0}});
	var userC = Meteor.users.findOne({_id:this.userId});
	console.log(userC);
	//console.log(JSON.stringify(citoyen.fetch()));
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
//console.log(latlng.longitude);
//console.log(radius);
		//selector startDate endDate sort et limit
		var inputDate = new Date();
		//console.log(inputDate);
		/*console.log(JSON.stringify(Events.find({'geoPosition': {
			$nearSphere: {
				$geometry: {
					type: "Point",
					coordinates: [latlng.longitude, latlng.latitude]
				},
				$maxDistance: radius
			}}},{_disableOplog: true}).fetch()));*/

		return Events.find({startDate:{$lte:inputDate},endDate:{$gte:inputDate},'geoPosition': {
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
					console.log(news.author);
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
console.log(JSON.stringify(Citoyens.find({'geoPosition': {
	$nearSphere: {
		$geometry: {
			type: "Point",
			coordinates: [latlng.longitude, latlng.latitude]
		},
		$maxDistance: radius
	}}},{_disableOplog: true,fields:{pwd:0}}).fetch()));
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
