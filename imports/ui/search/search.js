import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/underscore';

import './search.html';

let pageSession = new ReactiveDict('pageSearchGlobal');

/*Template.searchGlobal.onCreated(function () {
    pageSession.set( 'searchGlobal', null );
    pageSession.set('filter', null );
  });*/

Template.searchGlobal.onRendered(function () {
      this.autorun(function(c) {
        if(pageSession.get("filter")){
        let query = pageSession.get("filter");
        const querySearch = {};
        if ( query.charAt( 0 ) == '#' && query.length > 1) {
          querySearch['name'] = query;
          querySearch['searchTag'] = [query.substr(1)];
        }else{
          querySearch['name'] = query;
        }
        //querySearch['searchTag'] = query;
        //querySearch['locality'] = ;
        querySearch['searchType'] = ['persons','organizations','projects','events'];
        querySearch['searchBy'] = 'ALL';
        Meteor.call('searchGlobalautocomplete',querySearch,function(error, result){
          let array = _.map(result, function(array,key) {
             return {
               _id:key,
               name:array.name,
             profilThumbImageUrl:array.profilThumbImageUrl,
             type:array.type,
             typeSig:array.typeSig,
             address:array.address
           };
           });
           //console.log(array);
          if(result){
            pageSession.set( 'searchGlobal', array );
          }
        });
      }
      });
  });

  Template.searchGlobal.helpers({
    searchGlobal () {
      return pageSession.get("searchGlobal");
    },
    countSearchGlobal () {
      return pageSession.get("searchGlobal") && pageSession.get("searchGlobal").length;
    },
    filter () {
      return pageSession.get("filter");
    },
    icone (icone){
      if(icone === 'citoyens'){
        return {class:'icon fa fa-user yellow'};
      }else if(icone === 'projects'){
        return {class:'icon fa fa-lightbulb-o purple'};
      }else if(icone === 'organizations'){
        return {class:'icon fa fa-users green'};
      }else if(icone === 'city'){
        return {class:'icon fa fa-university red'};
      }
    },
    urlType(){
      if(this.typeSig === 'citoyens'){
        return {class:'icon fa fa-user yellow'};
      }else if(this.typeSig === 'projects'){
        return {class:'icon fa fa-lightbulb-o purple'};
      }else if(this.typeSig === 'organizations'){
        return {class:'icon fa fa-users green'};
      }else if(this.typeSig === 'city'){
        return {class:'icon fa fa-university red'};
      }
    }
  });

  Template.searchGlobal.events({
    'keyup #search, change #search':_.throttle((event,template) => {
      if(event.currentTarget.value.length>2){
        pageSession.set( 'filter', event.currentTarget.value);
      }
    }, 500)
  });
