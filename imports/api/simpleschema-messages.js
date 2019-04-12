import SimpleSchema from 'simpl-schema';
import i18n from 'meteor/universe:i18n';


SimpleSchema.setDefaultMessages({
  messages: {
    fr: {
      required: 'Veuillez saisir quelque chose',
      minString: 'Veuillez saisir au moins {{min}} caractères',
      maxString: 'Veuillez saisir moins de {{max}} caractères',
      minNumber: 'Ce champ doit être superieur ou égal à {{min}}',
      maxNumber: 'Ce champ doit être inferieur ou égal à {{max}}',
      minNumberExclusive: 'Ce champ doit être superieur à {{min}}',
      maxNumberExclusive: 'Ce champ doit être inferieur à {{max}}',
      minDate: 'La date doit est posterieure au {{min}}',
      maxDate: 'La date doit est anterieure au {{max}}',
      badDate: 'Cette date est invalide',
      minCount: 'Vous devez saisir plus de {{minCount}} valeurs',
      maxCount: 'Vous devez saisir moins de {{maxCount}} valeurs',
      noDecimal: 'Ce champ doit être un entier',
      notAllowed: "{{{value}}} n'est pas une valeur acceptée",
      expectedType: '{{{label}}} must be of type {{dataType}}',
      regEx({
        label,
        regExp,
      }) {
        switch (regExp) {
          case (SimpleSchema.RegEx.Email.toString()):
          case (SimpleSchema.RegEx.EmailWithTLD.toString()):
            return 'Cette adresse e-mail est incorrecte';
          case (SimpleSchema.RegEx.Domain.toString()):
          case (SimpleSchema.RegEx.WeakDomain.toString()):
            return 'Ce champ doit être un domaine valide';
          case (SimpleSchema.RegEx.IP.toString()):
            return 'Cette adresse IP est invalide';
          case (SimpleSchema.RegEx.IPv4.toString()):
            return 'Cette adresse IPv4 est invalide';
          case (SimpleSchema.RegEx.IPv6.toString()):
            return 'Cette adresse IPv6 est invalide';
          case (SimpleSchema.RegEx.Url.toString()):
            return 'Cette URL is invalide';
          case (SimpleSchema.RegEx.Id.toString()):
            return 'Cet identifiant alphanumérique est invalide';
          case (SimpleSchema.RegEx.ZipCode.toString()):
            return 'Ce code ZIP est invalide';
          case (SimpleSchema.RegEx.Phone.toString()):
            return 'Ce numéro de téléphone est invalide';
          default:
            return 'Ce champ a échoué la validation par Regex';
        }
      },
      keyNotInSchema: "Le champ {{name}} n'est pas permis par le schéma",
    },
  },
});

SimpleSchema.extendOptions(['autoform']);


