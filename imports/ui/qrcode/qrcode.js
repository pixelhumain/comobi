import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';

import './qrcode.html';

Template.qrcode.onRendered(function () {
  const scope = Router.current().params.scope;
  const type = (scope === 'citoyens') ? 'person' : scope.substring(0,scope.length-1);
  //let qrresult = {type:type,_id:Router.current().params._id};
  const qrLink = `https://www.communecter.org/#${type}.detail.id.${Router.current().params._id}`;
  const qr = JSON.stringify(qrLink);
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
});

Template.qrcode.onDestroyed(function () {
	this.$('#qrcode image').remove();
});
