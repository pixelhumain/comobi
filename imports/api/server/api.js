import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { request } from 'meteor/froatsnook:request';

export const callPixelRest = function (token,method,controller,action,post){
  console.log(token);
  post["X-Auth-Token"] = token;
  console.log(post);
  let responsePost = HTTP.call( method, 'http://qa.communecter.org/communecter/'+controller+'/'+action, {
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

export const callPixelUploadRest = function (token,folder,ownerId,input,imageURL,name){
  console.log(token);
  let post = {}
  post["X-Auth-Token"] = token;
  console.log(post);

  let result = request.getSync(imageURL, {
    encoding: null
  });
  if (result.response.statusCode == 200)
  {
    let imgData = result.body;
    let content_type = result.response.headers['content-type'];
    let content_length = result.response.headers['content-length'];
    let formData = {
      folder_paths: 'imported_images',
      newsImage: {
        value:  imgData,
        options: {
          filename: name,
          contentType: content_type
        }
      }
    }

    let responsePost = HTTP.call( 'POST', 'http://qa.communecter.org/communecter/document/upload/dir/communecter/folder/'+folder+'/ownerId/'+ownerId+'/input/'+input, {
      headers:{
        'X-Auth-Token' : token,
        'Origin':"http://meteor.communecter.org"
      },
      params: post,
      npmRequestOptions : {
        jar: true,
        body: null,
        formData: formData
      }
    });

    console.log(responsePost);
    responsePost.data = JSON.parse(responsePost.content);
    if(responsePost && responsePost.statusCode == 200 && responsePost.data && responsePost.data.result){
      return responsePost;
    }else{
      if(responsePost && responsePost.data && responsePost.data.msg){
        throw new Meteor.Error("error_call",responsePost.data.msg);
      }else{
        throw new Meteor.Error("error_server", "error server");
      }
    }

  }


}

export const authPixelRest = function (email,pwd){
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
