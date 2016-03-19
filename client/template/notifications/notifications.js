
Template.notifications.helpers({
  notifications () {
    return NotificationHistory.find({});
  },
  notificationsCount () {
    return NotificationHistory.find({}).count();
  }
});

Template.notifications.events({
    'click .removeMe': function(event, template) {
        Meteor.call('markRead', this._id, function(err, resp) {
            console.log('mark as read response', resp)
        });
    },
    'click .clickGo': function(event, template) {
      event.preventDefault();
        Meteor.call('registerClick', this._id);
        Router.go(this.link);
    }
})
