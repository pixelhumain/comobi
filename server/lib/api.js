callPixelRest = function(token,method,controller,action,post){
  console.log(token);
  post["X-Auth-Token"] = token;
  console.log(post);
    var responsePost = HTTP.call( method, 'http://qa.communecter.org/communecter/'+controller+'/'+action, {
      headers:{
      'X-Auth-Token' : token,
      'Origin':"http://meteor.communecter.org"
    },
      params: post,
      npmRequestOptions : {
        jar: true
      }
    });
        console.log(responsePost);
  if(responsePost && responsePost.data && responsePost.data.result){
    return responsePost;
  }else{
    if(responsePost && responsePost.data && responsePost.data.msg){
      throw new Meteor.Error("error_call",responsePost.data.msg);
    }else{
        throw new Meteor.Error("error_server", "error server");
    }
  }
}

authPixelRest = function(email,pwd){
var response = HTTP.call( 'POST', 'http://qa.communecter.org/communecter/person/authenticate', {
  params: {
    "pwd": pwd,
    "email": email
  },
  npmRequestOptions : {
    jar: true
  }
});
return response;
}
