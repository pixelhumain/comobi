pageSession = new ReactiveDict('pageEvents');

Template.listEvents.helpers({
  events () {
      var inputDate = new Date();
      return Events.find({startDate:{$lte:inputDate},endDate:{$gte:inputDate}});
  },
  countEvents () {
      var inputDate = new Date();
      return Events.find({startDate:{$lte:inputDate},endDate:{$gte:inputDate}}).count();
  },
});
