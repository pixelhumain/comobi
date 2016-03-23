NotificationHistory = new Mongo.Collection("notification_history");

NotificationHistory.helpers({
  authorNotify : function () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
  },
  news : function () {
    return News.findOne({_id:new Mongo.ObjectID(this.newsId)})
  },
});
