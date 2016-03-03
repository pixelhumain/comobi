capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

nameToCollection = function(name) {
  return this[capitalize(name)];
};
