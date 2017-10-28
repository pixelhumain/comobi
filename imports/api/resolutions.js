import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import { _ } from 'meteor/underscore';

export const Resolutions = new Mongo.Collection('resolutions', { idGeneration: 'MONGO' });

if (Meteor.isClient) {
  import { Chronos } from './client/chronos.js';

  Resolutions.helpers({
    isEndAmendement() {
      const end = moment(this.amendementDateEnd).toDate();
      return Chronos.moment(end).isBefore(); // True
    },
    isEndVote() {
      const end = moment(this.voteDateEnd).toDate();
      return Chronos.moment(end).isBefore(); // True
    },
    isNotEndAmendement() {
      const end = moment(this.amendementDateEnd).toDate();
      return Chronos.moment().isBefore(end); // True
    },
    isNotEndVote() {
      const end = moment(this.voteDateEnd).toDate();
      return Chronos.moment().isBefore(end); // True
    },
  });
} else {
  Resolutions.helpers({
    isEndAmendement() {
      const end = moment(this.amendementDateEnd).toDate();
      return moment(end).isBefore(); // True
    },
    isEndVote() {
      const end = moment(this.voteDateEnd).toDate();
      return moment(end).isBefore(); // True
    },
    isNotEndAmendement() {
      const end = moment(this.amendementDateEnd).toDate();
      return moment().isBefore(end); // True
    },
    isNotEndVote() {
      const end = moment(this.voteDateEnd).toDate();
      return moment().isBefore(end); // True
    },
  });
}

Resolutions.helpers({
  isVisibleFields (field) {
    return true;
  },
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  scopeVar () {
    return 'resolutions';
  },
  scopeEdit () {
    return 'resolutionsEdit';
  },
  listScope () {
    return 'listResolutions';
  },
  momentAmendementDateEnd() {
    return moment(this.amendementDateEnd).toDate();
  },
  momentVoteDateEnd() {
    return moment(this.voteDateEnd).toDate();
  },
  formatAmendementDateEnd() {
    return moment(this.amendementDateEnd).format('DD/MM/YYYY HH:mm');
  },
  formatVoteDateEnd() {
    return moment(this.voteDateEnd).format('DD/MM/YYYY HH:mm');
  },
  voteCanChangeBool () {
    return this.convertBool(this.voteCanChange);
  },
  voteAnonymousBool () {
    return this.convertBool(this.voteAnonymous);
  },
  amendementActivatedBool () {
    return this.convertBool(this.amendementActivated);
  },
  convertBool(value) {
    return (value === 'true' || value === true);
  },
  creatorProfile () {
    return Citoyens.findOne({
      _id: new Mongo.ObjectID(this.creator),
    }, {
      fields: {
        name: 1,
        profilThumbImageUrl: 1,
      },
    });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  votesResultat () {
    const votes = this.votes ? this.votes : null;
    const majority = this.majority ? parseInt(this.majority) : 50;
    const voteUp = votes && votes.up ? votes.up.length : 0;
    const voteDown = votes && votes.down ? votes.down.length : 0;
    const voteWhite = votes && votes.white ? votes.white.length : 0;
    const voteUncomplet = votes && votes.uncomplet ? votes.uncomplet.length : 0;
    const totalVotes = voteUp + voteDown + voteWhite + voteUncomplet;
    const pourcVoteUp = totalVotes > 0 ? (100 * voteUp) / totalVotes : 0;
    const pourcVoteDown = totalVotes > 0 ? (100 * voteDown) / totalVotes : 0;
    const pourcVoteWhite = totalVotes > 0 ? (100 * voteWhite) / totalVotes : 0;
    const pourcVoteUncomplet = totalVotes > 0 ? (100 * voteUncomplet) / totalVotes : 0;
    const meVoteUp = (votes && votes.up && Meteor.userId() && votes.up.includes(Meteor.userId()));
    const meVoteDown = (votes && votes.down && Meteor.userId() && votes.down.includes(Meteor.userId()));
    const meVoteWhite = (votes && votes.white && Meteor.userId() && votes.white.includes(Meteor.userId()));
    const meVoteUncomplet = (votes && votes.uncomplet && Meteor.userId() && votes.uncomplet.includes(Meteor.userId()));
    const meVote = (meVoteUp || meVoteDown || meVoteWhite || meVoteUncomplet);
    const voteValid = (totalVotes > 0 && pourcVoteUp > majority);
    const voteStart = (totalVotes > 0);
    return {
      voteStart,
      voteValid,
      totalVotes,
      meVote,
      voteUp: { nb: voteUp.toString(), pourc: pourcVoteUp.toString(), meVoteUp },
      voteDown: { nb: voteDown.toString(), pourc: pourcVoteDown.toString(), meVoteDown },
      voteWhite: { nb: voteWhite.toString(), pourc: pourcVoteWhite.toString(), meVoteWhite },
      voteUncomplet: { nb: voteUncomplet.toString(), pourc: pourcVoteUncomplet.toString(), meVoteUncomplet },
    };
  },
  votesAmendements (votes) {
    const voteUp = votes && votes.up ? votes.up.length : 0;
    const voteDown = votes && votes.down ? votes.down.length : 0;
    const voteWhite = votes && votes.white ? votes.white.length : 0;
    const totalVotes = voteUp + voteDown + voteWhite;
    const pourcVoteUp = totalVotes > 0 ? (100 * voteUp) / totalVotes : 0;
    const pourcVoteDown = totalVotes > 0 ? (100 * voteDown) / totalVotes : 0;
    const pourcVoteWhite = totalVotes > 0 ? (100 * voteWhite) / totalVotes : 0;
    const meVoteUp = (votes && votes.up && Meteor.userId() && votes.up.includes(Meteor.userId()));
    const meVoteDown = (votes && votes.down && Meteor.userId() && votes.down.includes(Meteor.userId()));
    const meVoteWhite = (votes && votes.white && Meteor.userId() && votes.white.includes(Meteor.userId()));
    const meVote = (meVoteUp || meVoteDown || meVoteWhite);
    const voteValid = (totalVotes > 0 && pourcVoteUp > 50);
    const voteStart = (totalVotes > 0);
    return {
      voteStart,
      voteValid,
      totalVotes,
      meVote,
      voteUp: { nb: voteUp.toString(), pourc: pourcVoteUp.toString(), meVoteUp },
      voteDown: { nb: voteDown.toString(), pourc: pourcVoteDown.toString(), meVoteDown },
      voteWhite: { nb: voteWhite.toString(), pourc: pourcVoteWhite.toString(), meVoteWhite },
    };
  },
  objectKeyArrayAmendements () {
    const array = [];
    if (this.amendements) {
      const amendements = this.amendements;
      const self = this;
      Object.keys(amendements).forEach(function(v) {
        amendements[v].idKey = v;
        amendements[v].votesObject = self.votesAmendements(amendements[v].votes);
        array.push(amendements[v]);
      });
    }
    return array;
  },
  listComments () {
    // console.log('listComments');
    return Comments.find({
      contextId: this._id._str,
    }, { sort: { created: -1 } });
  },
  commentsCount () {
    if (this.commentCount) {
      return this.commentCount;
    }
    return 0;
  },
});
