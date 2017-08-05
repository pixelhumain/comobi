import { Meteor } from 'meteor/meteor';
import { Push } from 'meteor/raix:push';

// collection
import { Citoyens } from '../citoyens.js';

/* Accounts.registerLoginHandler(function(loginRequest) {
  if(!loginRequest.email || !loginRequest.pwd) {
    return null;
  }

    const response = HTTP.call( 'POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/authenticate`, {
      params: {
        "email": loginRequest.email,
        "pwd": loginRequest.pwd,
      }
    });

    if(response && response.data && response.data.result === true && response.data.id){
      //var pswdDigest = SHA256(loginRequest.email+loginRequest.pwd)
      //var pswdDigest = CryptoJS.SHA256(loginRequest.email+loginRequest.pwd).toString();
      let userId = null;
      let retourId = null;

      //var userC = Citoyens.findOne({email: loginRequest.email,pwd:pswdDigest},{fields:{pwd:0}});
      if(response.data.id && response.data.id.$id){
        retourId = response.data.id.$id;
      }else{
        retourId = response.data.id;
      }
      //console.log(response.data);
      const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(retourId) },{fields:{pwd:0}});

      if(!userC) {
        throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'Communecter Login Failed');
      } else {
        //ok valide
        var userM = Meteor.users.findOne({'_id':userC._id._str});
        console.log(userM);
        if(userM && userM.profile &&  userM.profile.pixelhumain){
          //Meteor.user existe
          userId= userM._id;
          Meteor.users.update(userId,{$set: {'profile.pixelhumain': userC,emails:[userC.email]}});
        }else{
          //Meteor.user n'existe pas
          //username ou emails
          userId = Meteor.users.insert({_id:userC._id._str,emails:[userC.email]});
          Meteor.users.update(userId,{$set: {'profile.pixelhumain': userC}});
        }
      }

      const stampedToken = Accounts._generateStampedLoginToken();
      Meteor.users.update(userId,
        {$push: {'services.resume.loginTokens': stampedToken}}
      );
      this.setUserId(userId);
      console.log(userId);
      return {
        userId: userId,
        token: stampedToken.token
      }
    }else{
      if(response && response.data && response.data.result === false){
        throw new Meteor.Error(Accounts.LoginCancelledError.numericError, response.data.msg);
      } else if(response && response.data && response.data.result === true && response.data.msg){
        throw new Meteor.Error(response.data.msg);
      }

    }
}); */

Accounts.onLogin(function(user) {
// console.log(user.user._id)
  const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(user.user._id) }, { fields: { pwd: 0 } });

  if (!userC) {
  // throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'Communecter Login Failed');
  } else {
  // ok valide
    const userM = Meteor.users.findOne({ _id: userC._id._str });
    // console.log(userM);
    if (userM && userM.profile && userM.profile.pixelhumain) {
    // Meteor.user existe
      userId = userM._id;
      Meteor.users.update(userId, { $set: { 'profile.pixelhumain': userC } });
    } else {
    // username ou emails
      userId = userM._id;
      Meteor.users.update(userId, { $set: { 'profile.pixelhumain': userC } });
    }
  }
});

if (Meteor.isDevelopment) {
  Push.debug = true;
  Push.Configure({
    gcm: {
      apiKey: Meteor.settings.pushapiKey,
      projectNumber: 376774334081,
    },
    production: true,
    sound: true,
    badge: true,
    alert: true,
    vibrate: true,
    sendInterval: null,
  });
} else {
  Push.Configure({
    gcm: {
      apiKey: Meteor.settings.pushapiKey,
      projectNumber: 376774334081,
    },
    production: true,
    sound: true,
    badge: true,
    alert: true,
    vibrate: true,
  });
}

/* Push.Configure({
  apn: {
    certData: Assets.getText('apn-production/PushCommunEventCert.pem'),
    keyData: Assets.getText('apn-production/PushCommunEventKey.pem'),
    production: true,
    //gateway: 'gateway.push.apple.com',
  },
  gcm: {
    apiKey: '',
    projectNumber:
  }
   //'production': true,
   //'sound': true,
   //'badge': true,
   //'alert': true,
   //'vibrate': true,
  // 'sendInterval': 15000, Configurable interval between sending
  // 'sendBatchSize': 1, Configurable number of notifications to send per batch
  // 'keepNotifications': false,
//
}); */

Push.allow({
  send(userId, notification) {
    return true;
  },
});
