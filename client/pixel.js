Template.layout.onCreated(function(){
  Meteor.subscribe('notificationsUser');
});

Template.layout.events({
	'click .scanner' : function(event, template){
		event.preventDefault();
		if(Meteor.isCordova){
			//alert(Router.current().params._id);
        cordova.plugins.barcodeScanner.scan(
            function (result) {
            	if(result.cancelled==false && result.text && result.format=='QR_CODE'){
                console.log(result.text);
            		Router.go("newsList",{scope:'events',_id:result.text});
            		}else{
                return ;
            		}
            },
            function (error) {
                alert("Scanning failed: " + error);
                	return ;
            }
        );
        }
        	return ;
}
});

Template.layout.helpers({
  notificationsCount () {
    return NotificationHistory.find({}).count();
  }
});
