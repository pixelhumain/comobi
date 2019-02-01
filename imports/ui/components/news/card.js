import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonActionSheet } from 'meteor/meteoric:ionic';

import './card.html';

Template.scopeCard.helpers({
  countsousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`);
  },
  issousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`) > 0;
  },
  preferenceTrue (value) {
    return !!((value === true || value === 'true'));
  },
});

Template.actionSheet.events({
  'click .action-card-citoyen' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Citoyens'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'info' });
        }
        if (index === 1) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'network' });
        }
        if (index === 2) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'descriptions' });
        }
        if (index === 3) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'locality' });
        }
        if (index === 4) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'preferences' });
        }
        return true;
      },
    });
  },
  'click .action-card-events' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Events'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit dates')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'info' });
        }
        if (index === 1) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'network' });
        }
        if (index === 2) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'descriptions' });
        }
        if (index === 3) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'locality' });
        }
        if (index === 4) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'when' });
        }
        if (index === 5) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'preferences' });
        }
        return true;
      },
    });
  },
  'click .action-card-organizations' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Organizations'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'info' });
        }
        if (index === 1) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'network' });
        }
        if (index === 2) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'descriptions' });
        }
        if (index === 3) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'locality' });
        }
        if (index === 4) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'preferences' });
        }
        return true;
      },
    });
  },
  'click .action-card-projects' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Projects'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit dates')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'info' });
        }
        if (index === 1) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'network' });
        }
        if (index === 2) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'descriptions' });
        }
        if (index === 3) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'locality' });
        }
        if (index === 4) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'when' });
        }
        if (index === 5) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'preferences' });
        }
        return true;
      },
    });
  },
  'click .action-card-poi' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Poi'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('poiEdit', { _id: Router.current().params._id });
        }
        return true;
      },
    });
  },
  'click .action-card-classified' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Classified'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('classifiedEdit', { _id: Router.current().params._id });
        }
        return true;
      },
    });
  },
});
