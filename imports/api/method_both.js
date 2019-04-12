import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
// Game
import { Gamesmobile, Playersmobile, Questsmobile } from './gamemobile.js';

export const questValidate = new ValidatedMethod({
  name: 'questValidate',
  validate: new SimpleSchema({
    gameId: { type: String },
    questId: { type: String },
    choiceId: { type: String },
  }).validator(),
  run({ gameId, questId, choiceId }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const query = {};
    query._id = new Mongo.ObjectID(gameId);
    const game = Gamesmobile.findOne(query);
    if (!game) {
      throw new Meteor.Error('not-game', 'not-game');
    }
    if (game.isNotStart()) {
      throw new Meteor.Error('game-is-not-start', 'game-is-not-start');
    }
    if (game.isEnd()) {
      throw new Meteor.Error('game-is-end', 'game-is-end');
    }
    const quest = Questsmobile.findOne({ _id: new Mongo.ObjectID(questId) });
    if (!quest) {
      throw new Meteor.Error('quest-not-exist', 'quest-not-exist');
    }
    const player = Playersmobile.findOne({ idUser: this.userId, idGame: gameId });
    if (!player) {
      throw new Meteor.Error('player-not-exit', 'player-not-exit');
    }
    if (player && player.finishedAt) {
      throw new Meteor.Error('game-finished', 'game-finished');
    }
    const playerQuestExist = Playersmobile.findOne({ idUser: this.userId, idGame: gameId, validateQuest: { $in: [questId] } });
    if (playerQuestExist) {
      throw new Meteor.Error('player-quest-exit', 'player-quest-exit');
    }
    // mauvaise réponse
    if (quest.questId !== choiceId) {
      // throw new Meteor.Error('quest-wrong-answer', 'quest-wrong-answer');
      const modifier = {};
      modifier.$addToSet = { errorQuest: questId };
      const countGameQuest = Questsmobile.find({ idGame: gameId }).count();
      const validateCount = (player.validateQuest && player.validateQuest.length && player.validateQuest.length > 0) ? player.validateQuest.length : 0;
      const errorCount = (player.errorQuest && player.errorQuest.length && player.errorQuest.length > 0) ? player.errorQuest.length : 0;
      const totalCount = validateCount + errorCount;
      if (totalCount < countGameQuest) {
        const countValidateQuest = totalCount + 1;
        if (countValidateQuest === countGameQuest) {
          // fin du jeu
          modifier.$set = {};
          modifier.$set.finishedAt = new Date();
        }
      }
      const retour = Playersmobile.update({ _id: player._id }, modifier);
      if (retour) {
        const retourQuest = Questsmobile.update({ _id: new Mongo.ObjectID(questId) }, { $inc: { numberPlayerError: 1 } });
        return 'error';
      }
    } else {
      const modifier = {};
      modifier.$inc = { totalPoint: quest.pointWin };
      modifier.$addToSet = { validateQuest: questId };
      const countGameQuest = Questsmobile.find({ idGame: gameId }).count();
      const validateCount = (player.validateQuest && player.validateQuest.length && player.validateQuest.length > 0) ? player.validateQuest.length : 0;
      const errorCount = (player.errorQuest && player.errorQuest.length && player.errorQuest.length > 0) ? player.errorQuest.length : 0;
      const totalCount = validateCount + errorCount;
      if (totalCount < countGameQuest) {
        const countValidateQuest = totalCount + 1;
        if (countValidateQuest === countGameQuest) {
          // fin du jeu
          modifier.$set = {};
          modifier.$set.finishedAt = new Date();
        }
      }
      const retour = Playersmobile.update({ _id: player._id }, modifier);
      if (retour) {
        const retourQuest = Questsmobile.update({ _id: new Mongo.ObjectID(questId) }, { $inc: { numberPlayerValidate: 1 } });
        return 'valid';
      }
    }
  },
});

export const gameParticipate = new ValidatedMethod({
  name: 'gameParticipate',
  validate: new SimpleSchema({
    gameId: { type: String },
  }).validator(),
  run({ gameId }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const query = {};
    query._id = new Mongo.ObjectID(gameId);
    const game = Gamesmobile.findOne(query);
    if (!game) {
      throw new Meteor.Error('not-game', 'not-game');
    }
    if (game.isNotStart()) {
      throw new Meteor.Error('game-is-not-start', 'game-is-not-start');
    }
    if (game.isEnd()) {
      throw new Meteor.Error('game-is-end', 'game-is-end');
    }
    const player = Playersmobile.findOne({ idUser: this.userId, idGame: gameId });
    if (player && player._id) {
      throw new Meteor.Error('player-already-present', 'player-already-present');
    }
    const doc = {};
    doc.idUser = this.userId;
    doc.idGame = gameId;
    // SchemasPlayersmobileRest.clean(doc);
    // SchemasPlayersmobileRest.validate(doc);
    const retour = Playersmobile.insert(doc);
    if (retour) {
      Gamesmobile.update(
        { _id: new Mongo.ObjectID(gameId) },
        { $inc: { numberPlayers: 1 } },
      );
    }
    return retour;
  },
});
