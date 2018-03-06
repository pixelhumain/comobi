import { Meteor } from 'meteor/meteor';
import CallLog from './call_log';
Meteor.publish('VideoChatPublication', function() {
    return CallLog.find({
        $or: [{
            caller: this.userId,
            status: "NEW"
        }, {
            target: this.userId,
            status: "NEW"
        }, {
            callerConnectionId: this.connection.id,
            status: "ACCEPTED"
        }, {
            targetConnectionId: this.connection.id,
            status: "ACCEPTED"
        }, {
            targetConnectionId: this.connection.id,
            status: "REJECTED"
        }, {
            callerConnectionId: this.connection.id,
            status: "REJECTED"
        }, {
            callerConnectionId: this.connection.id,
            status: "CONNECTED"
        }, {
            targetConnectionId: this.connection.id,
            status: "CONNECTED"
        }, {
            callerConnectionId: this.connection.id,
            status: "FINISHED"
        }, {
            targetConnectionId: this.connection.id,
            status: "FINISHED"
        }]
    });
});
