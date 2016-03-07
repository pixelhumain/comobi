Push.debug = true;

Push.allow({
        send: function(userId, notification) {
            return true;
        }
});
