import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Push } from 'meteor/raix:push';
import { moment } from 'meteor/momentjs:moment';

import { ActivityStream } from '../../api/activitystream.js';

const pushUser = (title,text,payload,query,badge) => {
  const notId = Math.round(new Date().getTime() / 1000);
  Push.send({
    from: 'push',
    title: title,
    text: text,
    payload: payload,
    sound: 'default',
    query: query,
    badge: badge,
    apn: {
      sound: 'default'
    },
    notId: notId
  });
};

Meteor.startup(function(){

let query = {};
query['created'] = {$gt: new Date()};
let options = {};
options['sort'] = {created: 1};
var initNotifystart = ActivityStream.find(query,options).observe({
added: function(notification) {
  if(!initNotifystart) return ;
  //le serveur start donc la date est fixe on recupre les notifs qui sont créer aprés
  //mais ensuite
  console.log(notification);
  if(notification && notification.notify && notification.notify.id && notification.notify.displayName){

  let title = 'notification';
  let text = notification.notify.displayName;

  let notifsId = _.map(notification.notify.id, function(ids,key){
    return key;
  });

  _.each(notifsId,function(value){
    let query = {};
    query['userId'] = value;
    let badge = ActivityStream.api.queryUnseen(value).count();
    console.log({value,badge});
    pushUser(title,text,notification,query,badge)
  },title,text,notification);
  
  }
}
});

});
