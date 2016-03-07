
Template.listAttendees.helpers({
  events () {
    return Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  },
  onlineAttendees () {
    return Meteor.users.findOne({_id : this._id._str}).profile.online;
  },
  isFollowsAttendees (followId){
    if(Meteor.userId()===followId){
      return true;
    }else{
      let citoyen = Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())},{fields:{links:1}});
      return citoyen.links && citoyen.links.follows && citoyen.links.follows[followId];
    }

  }
});
