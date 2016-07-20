import { Meteor } from 'meteor/meteor';
import { Push } from 'meteor/raix:push';

//collection
import { Citoyens } from '../citoyens.js';

Accounts.registerLoginHandler(function(loginRequest) {
  if(!loginRequest.email || !loginRequest.pwd) {
    return null;
  }
  var pswdDigest = SHA256(loginRequest.email+loginRequest.pwd)
  //var pswdDigest = CryptoJS.SHA256(loginRequest.email+loginRequest.pwd).toString();

  var userId = null;
  var userC = Citoyens.findOne({email: loginRequest.email,pwd:pswdDigest},{fields:{pwd:0}});

  if(!userC) {
    throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'Communecter Login Failed');;
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

  var stampedToken = Accounts._generateStampedLoginToken();
  Meteor.users.update(userId,
    {$push: {'services.resume.loginTokens': stampedToken}}
  );
  this.setUserId(userId);
  console.log(userId);
  return {
    userId: userId,
    token: stampedToken.token
  }
});

Push.debug = true;

Push.Configure({
  apn: {
    certData: Assets.getText('apn-production/PushCommunEventCert.pem'),
    keyData: Assets.getText('apn-production/PushCommunEventKey.pem'),
    passphrase: 'Djab974',
    production: true,
    //gateway: 'gateway.push.apple.com',
  },
  gcm: {
    apiKey: 'AIzaSyC4jbvZam56G7f0dJzAz2N5soH46jPep8Y',
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
});

Push.allow({
        send: function(userId, notification) {
            return true;
        }
});
