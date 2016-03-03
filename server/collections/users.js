Meteor.users.allow({
    update: function(userId, docs, fields, modifier) {
return userId === doc._id;
        }
});
