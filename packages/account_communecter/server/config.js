import { Accounts } from 'meteor/accounts-base';

Accounts.registerLoginHandler(function(loginRequest) {
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

      let userId = null;
      let retourId = null;

      if(response.data.id && response.data.id.$id){
        retourId = response.data.id.$id;
      }else{
        retourId = response.data.id;
      }
      //console.log(response.data);

      //ok valide
      var userM = Meteor.users.findOne({'_id':retourId});
      //console.log(userM);
      if(userM){
        //Meteor.user existe
        userId= userM._id;
        Meteor.users.update(userId,{$set: {emails:[loginRequest.email]}});
      }else{
        //Meteor.user n'existe pas
        //username ou emails
        userId = Meteor.users.insert({_id:retourId,emails:[loginRequest.email]});
      }


      const stampedToken = Accounts._generateStampedLoginToken();
      Meteor.users.update(userId,
        {$push: {'services.resume.loginTokens': stampedToken}}
      );
      this.setUserId(userId);
      //console.log(userId);
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
});
