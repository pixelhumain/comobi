import { Meteor } from 'meteor/meteor';
import CallLog from './call_log';
Meteor.publish('VideoChatPublication', function() {
    return CallLog.find({
        $or: [{
            caller: this.userId,
            status:{
                $ne:"FINISHED"
            }
        }, {
            target: this.userId,
            status:{
                $ne:"FINISHED"
            }
        }]
    });
});