let  pageSession = new ReactiveDict('pageSession');

const isValidEmail = ( email ) => {
  let emailTest = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
  if (emailTest.test(email) == false) {
    pageSession.set( 'error', 'Email not valid' );
    return false;
  }else{
    return true;
  }
};

Template.login.onCreated(function () {
  pageSession.set( 'error', false );
  pageSession.set( 'loading-logging', false );
});

Template.login.onRendered(function () {
  pageSession.set( 'error', false );
});

Template.login.events({
  'submit .login-form': function (event,template) {
    event.preventDefault();
    let email = event.target.email.value;
    let password = event.target.password.value;
    if(!email || !password){
      pageSession.set( 'error', 'Not completed all fields' );
      return;
    }

    if(!isValidEmail(email)){
      return;
    }
    pageSession.set( 'loading-logging', true );
    Meteor.loginAsPixel(email,password,function(error){
      if(!error) {
        Meteor.logoutOtherClients();
        pageSession.set( 'loading-logging', false );
        pageSession.set( 'error', null );
        Router.go('/');
      }else{
        //console.log(error);
        pageSession.set( 'loading-logging', false );
        pageSession.set( 'error', error.reason );
        return null;
      }
    });
  }
});
Template.login.helpers({
  loadingLogging () {
    return pageSession.get( 'loading-logging' );
  },
  error () {
    return pageSession.get( 'error' );
  },
});

Template.login.onCreated(function () {
  pageSession.set( 'error', false );
  pageSession.set( 'loading-signup', false );
  pageSession.set( 'cities', null );
});

Template.signin.onRendered(function () {
  pageSession.set( 'error', false );
  pageSession.set( 'cities', null );
  pageSession.set('codepostal', null );
  pageSession.set('cityselect', null );

  let geolocate = Session.get('geolocate');
  if(geolocate){
    var onOk=IonPopup.confirm({template:TAPi18n.__('Utiliser votre position actuelle ?'),
    onOk: function(){
      let geo = Location.getReactivePosition();
      if(geo && geo.latitude){
        let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
        Meteor.call('getcitiesbylatlng',latlng,function(error, result){
          if(result){
            pageSession.set('codepostal', result.postalCodes[0].postalCode);
            pageSession.set('cityselect', result.insee);
            Meteor.call('getcitiesbypostalcode',result.postalCodes[0].postalCode,function(error, data){
              if(data){
              pageSession.set( 'cities', data);
              }
            })
        }
        });
      }
    }});
  }
});

Template.signin.events({
'keyup #codepostal, change #codepostal': function(event,template){
  if(event.currentTarget.value.length==5){
    Meteor.call('getcitiesbypostalcode',event.currentTarget.value,function(error, data){
      pageSession.set( 'cities', data);
      return;
    })
}else{
  pageSession.set( 'cities', null );
  return;
}
},
'submit .signup-form': function (event,template) {
  event.preventDefault();
  pageSession.set( 'error', null );
  const trimInput = ( val ) => {
    return val.replace(/^\s*|\s*$/g, "");
  };
  let city;
  let email = trimInput(event.target.email.value);
  let username = trimInput(event.target.username.value);
  let password = event.target.password.value;
  let repassword = event.target.repassword.value;
  let name = trimInput(event.target.name.value);
  let codepostal = trimInput(event.target.codepostal.value);
  if(event.target.city && event.target.city.value){
    city = event.target.city.value;
  }

  if(!email || !password || !repassword || !name || !codepostal || !city || !username){
    pageSession.set( 'error', 'Not completed all fields' );
    return;
  }

  const isValidCodepostal = ( val ) => {
    if (val.length === 5) {
      return true;
    } else {
      pageSession.set( 'error', 'Postcode must be 5 digits' );
      return false;
    }
  };

  const isValidName = ( val ) => {
    if (val.length >= 6) {
      return true;
    } else {
      pageSession.set( 'error', 'Name is Too short' );
      return false;
    }
  };

  const isValidUsername = ( val ) => {
    if (val.length >= 6) {
      return true;
    } else {
      pageSession.set( 'error', 'Username is Too short' );
      return false;
    }
  };

  const isValidPassword = ( val ) => {
    if (val.length > 7) {
      return true;
    } else {
      pageSession.set( 'error', 'Password is Too short' );
      return false;
    }
  };


  if(!isValidName(name)){
    return;
  }
  if(!isValidUsername(username)){
    return;
  }
  if(!isValidEmail(email)){
    return;
  }
  if (!isValidPassword(password)){
    return;
  }
  if(!isValidCodepostal(codepostal)){
    return;
  }
  if(password != repassword){
    pageSession.set( 'error', 'Not the same password' );
    return;
  }

  //verifier
  let user = {};
  user.email = email;
  user.password = password;
  user.name = name;
  user.username = username;
  user.repassword = repassword;
  user.codepostal = codepostal;
  //numero insee
  user.city = city;

  pageSession.set( 'loading-signup', true );
  pageSession.set( 'error', null );
  //createUserAccount or createUserAccountRest
  console.log(user);
  Meteor.call("createUserAccountRest",user, function (error) {
    if(error){
      pageSession.set( 'loading-signup', false );
      console.log(error.error);
      pageSession.set( 'error', error.error );
    }else{
      Meteor.loginAsPixel(email,password,function(err){
        if(!err) {
          pageSession.set( 'loading-signup', false );
          pageSession.set( 'error', null );
          Router.go('/');
        }else{
          pageSession.set( 'loading-signup', false );
          pageSession.set( 'error', err.error );
          return false;
        }
      });
    }
  });
}
});

Template.signin.helpers({
  loadingLogging () {
    return pageSession.get( 'loading⁻signup' );
  },
  error () {
    return pageSession.get( 'error' );
  },
  city (){
    return pageSession.get( 'cities' );
  },
  citySelected (){
    if(pageSession.get( 'cityselect' )==this.insee){
      return "selected";
    }
  },
  codepostal (){
    return pageSession.get( 'codepostal' );
  }
});
