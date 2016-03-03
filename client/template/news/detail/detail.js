Template.newsDetail.helpers({
  scope () {
    //Router.current().params.scope
    //verifier le scope
    let scope = Session.get('scope');
    var collection = nameToCollection(scope);
    return collection.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  }
});

Template.newsDetail.events({
  "click .delete-photo" (e, t) {
    self=this;
    //let eventId = Router.current().params._id;
    let onOk=IonPopup.confirm({template:TAPi18n.__('are you sure you want to delete'),
    onOk: function(){
      Meteor.call('deletePhoto',self._id._str,function(){
        Router.go('newsList', {_id:Router.current().params._id,scope:Router.current().params.scope});
      });
    }});
    e.preventDefault();
  },
  "click .like-photo" (e, t) {
    Meteor.call('likePhoto', this._id._str);
    e.preventDefault();
  }
});
