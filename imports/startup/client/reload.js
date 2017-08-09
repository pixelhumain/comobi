import { Reload } from 'meteor/reload';
import { Tracker } from 'meteor/tracker';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';

Tracker.autorun(() => {
  if (Reload.isWaitingForResume()) {
    // window.location.replace(window.location.href)
    IonPopup.alert({ template: TAPi18n.__('Close and reopen the application to get the new version') });
  }
});
