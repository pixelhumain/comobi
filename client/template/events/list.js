pageSession = new ReactiveDict('pageEvents');

Template.listEvents.helpers({
  events () {
      var inputDate = new Date();
      return Events.find({});
  },
  countEvents () {
      var inputDate = new Date();
      return Events.find({}).count();
  },
});
