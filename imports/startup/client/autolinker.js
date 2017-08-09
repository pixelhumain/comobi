import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Autolinker from 'autolinker';
import sanitizeHtml from 'sanitize-html';

export const AutoLinkerMessage = (message) => {
  if (message) {
    const regUrls = new RegExp('(://|www\\.).+');

    const autolinker = new Autolinker({
      stripPrefix: false,
      urls: {
        schemeMatches: true,
        wwwMatches: true,
        tldMatches: true,
      },
      email: true,
      phone: true,
      twitter: false,
      replaceFn(match) {
        if (match.getType() === 'url') {
          if (regUrls.test(match.matchedText)) {
            if (match.matchedText.indexOf(Meteor.absoluteUrl()) === 0) {
              const tag = match.buildTag();
              tag.setAttr('target', '');
              return tag;
            }
            const tag = match.buildTag();
            if (Meteor.isDesktop) {
              tag.setAttr('target', '_blank');
            } else if (Meteor.isCordova) {
              tag.setAttr('target', '_system');
            } else {
              tag.setAttr('target', '_blank');
            }


            return true;
          }
        }

        return null;
      },
      className: 'positive',
    });
    const clean = sanitizeHtml(message, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a'],
      allowedAttributes: {
        a: ['href', 'name', 'target'],
      },
    });
    return autolinker.link(clean);
  }
  return undefined;
};

Meteor.startup(() => {
  Template.registerHelper('autolinker', message => AutoLinkerMessage(message));
});
