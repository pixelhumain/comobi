import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import CallLog from './call_log';

const streams = {};
const Services = {
    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */
    call(_id){
        check(_id, String);
        const meteorUser = Meteor.user();
        if (!meteorUser) {
            const err = new Meteor.Error(403, "USER_NOT_LOGGED_IN", {
                caller: meteorUser._id,
                target: _id
            });
            Meteor.VideoCallServices.onError(err);
            throw err;
        }
        if (Services.checkConnect(meteorUser._id, _id)) {
            const inCall = CallLog.findOne({
                status: "CONNECTED",
                target: _id
            });
            if (inCall) {
                const err = new Meteor.Error(500, "TARGET_IN_CALL", inCall);
                Meteor.VideoCallServices.onError(err, inCall, Meteor.userId());
                throw err;
            }
            else {
                CallLog.update({
                    $or: [{
                        status: {
                            $ne: "FINISHED"
                        },
                        caller: meteorUser._id
                    }, {
                        status: {
                            $ne: "FINISHED"
                        },
                        target: meteorUser._id
                    }]

                }, {
                    $set: {
                        status: "FINISHED"
                    }
                });
                const logId = CallLog.insert({
                    status: "NEW",
                    target: _id,
                    caller: meteorUser._id
                });
                streams[logId] = new Meteor.Streamer(logId);
                streams[logId].allowRead('all');
                streams[logId].allowWrite('all');
                return logId;
            }
        } else {
            const err = new Meteor.Error(403, "CONNECTION_NOT_ALLOWED", {
                target: meteorUser._id,
                caller: _id
            });
            Meteor.VideoCallServices.onError(err, _id, meteorUser);
            throw err;
        }

    },
    /**
     * Check if call connection should be permitted
     * @param _id {caller}
     * @param _id {target}
     * @returns boolean
     */
    checkConnect(caller, target){
        return true;
    },
    /**
     * Answer current phone call
     */
    answer(){
        const user = Meteor.user();
        if (!user) {
            const err = new Meteor.Error(403, "USER_NOT_LOGGED_IN");
            Meteor.VideoCallServices.onError(err);
            throw err;
        }
        const session = CallLog.findOne({
            target: user._id,
            status: 'NEW'
        });
        if (!session) {
            const err = new Meteor.Error(500, 'SESSION_NOT_FOUND', {
                target: user._id
            });
            Meteor.VideoCallServices.onError(err, undefined, user);
            throw err;
        }

        else {
            CallLog.update({
                _id: session._id
            }, {
                $set: {
                    status: 'ACCEPTED'
                }
            });
        }
    },
    /**
     * End current phone call
     */
    end(){
        const _id = Meteor.userId();
        CallLog.find({
            $or: [{
                status: {
                    $ne: 'FINISHED'
                },
                target: _id
            }, {
                status: {
                    $ne: 'FINISHED'
                },
                caller: _id
            }]
        }).forEach(call =>
            CallLog.update({
                _id: call._id
            }, {
                $set: {
                    status: 'FINISHED'
                }
            }));
    }
};

export {
    Services
};