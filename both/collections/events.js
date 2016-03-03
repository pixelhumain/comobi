Events = new Meteor.Collection("events", {idGeneration : 'MONGO'});

this.Schemas = this.Schemas || {};

/*
newEvent = new Object;
				newEvent.allDay = $(".form-event .all-day").bootstrapSwitch('state');
				newEvent.name = $(".form-event .event-name ").val();
				newEvent.type = $(".form-event .event-categories option:checked").val();
				newEvent.startDate = startDateSubmit;
				newEvent.endDate = endDateSubmit;
				newEvent.description = $(".form-event .eventDetail ").val();
				newEvent.postalCode = $(".form-event #postalCode ").val();
				newEvent.city = $(".form-event #city ").val();
				newEvent.country = $(".form-event #eventCountry ").val();
				newEvent.organizerId = $(".form-event #newEventOrgaId").val();
				newEvent.organizerType = $(".form-event #newEventOrgaType").val();
				newEvent.geoPosLatitude = $(".form-event #geoPosLatitude").val();
				newEvent.geoPosLongitude = $(".form-event #geoPosLongitude").val();
*/

this.Schemas.EventsRest = new SimpleSchema({
    name : {
      type : String
    },
    type : {
      type : String,
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'eventTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
    },
    country : {
      type : String,
      allowedValues: Countries_SELECT,
      autoform: {
        type: "select",
        options: Countries_SELECT_LABEL,
      }
    },
    streetAddress: {
      type : String,
      optional: true
    },
    postalCode: {
      type : String,
      min:5,
      max:9
    },
    city: {
      type : String,
      autoform: {
        type: "select"
      }
    },
    geoPosLatitude: {
      type: Number,
      decimal: true,
      optional:true
    },
    geoPosLongitude: {
      type: Number,
      decimal: true,
      optional:true
    },
    description : {
      type : String
    },
    allDay : {
      type : Boolean,
      defaultValue:false
    },
    startDate : {
      type : Date,
      optional:true
    },
    endDate : {
      type : Date,
      optional:true
    }
  });

var linksEvents = new SimpleSchema({
  events : {
    type: [Object],
    optional:true
  },
  attendees : {
    type: [Object],
    optional:true
  },
  organizer : {
    type: [Object],
    optional:true
  },
  creator : {
    type: [Object],
    optional:true
  },
  needs : {
    type: [Object],
    optional:true
  }
});


this.Schemas.Events = new SimpleSchema({
    name : {
      type : String
    },
    type : {
      type : String,
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'eventTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
    },
    address : {
      type : PostalAddress
    },
    geo : {
      type : GeoCoordinates
    },
    geoPosition : {
      type : GeoPosition
    },
    description : {
      type : String
    },
    allDay : {
      type : Boolean,
      defaultValue:false
    },
    startDate : {
      type : Date
    },
    endDate : {
      type : Date
    },
    links : {
      type : linksEvents,
      optional:true
    },
    creator : {
      type: String,
      autoValue: function() {
        if (this.isInsert) {
          return Meteor.userId();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: Meteor.userId()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    },
    created: {
      type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: new Date()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    }
  });

  Events.attachSchema(
    this.Schemas.Events
  );

  Events.helpers({
    creatorProfile: function () {
      return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
    },
    isCreator () {
      return this.creator === Meteor.userId();
    },
    isAttendees (){
    let attendees = _.filter(this.links.attendees, function(attendees,key){
       return key === Meteor.userId();
     });
      return this.links && this.links.attendees && attendees;
    },
    countAttendees () {
      return this.links && this.links.attendees && _.size(this.links.attendees);
    },
    isStart () {
      let start = moment(this.startDate).toDate();
      let now = moment().toDate();
      return moment(start).isBefore(now); // True
    },
    news () {
      return News.find({'scope.events':{$in:[Router.current().params._id]}},{sort: {"created": -1},limit: Session.get('limit') });
    },
    countNews () {
      return News.find({'scope.events':{$in:[Router.current().params._id]}}).count();
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });
