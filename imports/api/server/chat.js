/*import { Meteor } from 'meteor/meteor';
import microService from 'meteor/microservice';
import { SHA256 } from 'meteor/sha';

export const apiChat = {};

const ddpUrl = 'http://localhost:3000';
export const Chat = new microService(ddpUrl);

apiChat.login = function(params){
  try {
    let retourLogin;
    if(params.resume){
      retourLogin = Chat.callSync('login',{
                  "resume": params.resume
              });

    } else if (params.email && params.pwd){
      retourLogin = Chat.callSync('login',{
                  "email": params.email,
                  "pwd": params.pwd
              });
    }
    console.log(retourLogin);
    if(retourLogin && retourLogin.id){
      Chat.setUserId(retourLogin.id);
    }
    return retourLogin;
 } catch (e) {
   console.log('error');
   console.log(e);
   throw new Meteor.Error(e.error, e.message, e);
 }

};
*/

/*const pwd = 'Djab974Djab974';
const email = 'thomas.craipeau@gmail.com';
const retourUser= apiChat.login({email,pwd});

const room = Chat.callSync('loadHistory','GENERAL',null,50,{"$date":1497700914458});
    console.log(room);
const Message = Chat.collection('stream-room-messages');
const subUser = Chat.subscribe('stream-room-messages','GENERAL');
console.log(subUser);
console.log(Message.find().fetch());

Message.find({}).observe({
    added: function(item){
        console.log(item)
    },
    changed: function(newDocument, oldDocument){
        console.log(newDocument)
    }
});*/

//apiChat.login({resume});
//"resume": "auth-token"
