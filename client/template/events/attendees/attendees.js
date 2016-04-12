
Template.listAttendees.helpers({
  events () {
    return Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  },
  onlineAttendees () {
    let user = Meteor.users.findOne({_id : this._id._str});
    return user && user.profile && user.profile.online;
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

Template.listAttendees.events({
  "click .followperson-link" (evt) {
    evt.preventDefault();
		Meteor.call('followPersonExist',this._id._str);
	return ;
  }
});
