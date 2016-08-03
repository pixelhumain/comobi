import './qrcode.html';

import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';

 Template.qrcode.rendered = function(){
   let qrresult = {type:"event",_id:Router.current().params._id};
   let qr = JSON.stringify(qrresult);
   console.log(qr);
	this.$('#qrcode').qrcode({
    "text": qr,
     render: 'image',
     size:150,
     ecLevel: 'H',
     fill: "#000000",
     background: "#FFFFFF",
     radius: 0.2
});
this.$('#qrcode image').remove();
};

 Template.qrcode.destroyed = function(){

	this.$('#qrcode image').remove();
};
