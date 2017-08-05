import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
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
              const tag = match.buildTag();				// returns an `Autolinker.HtmlTag` instance for an <a> tag
              tag.setAttr('target', '');					// sets target to empty, instead of _blank
              return tag;
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
};

Meteor.startup(() => {
  Template.registerHelper('autolinker', message => AutoLinkerMessage(message));
});
