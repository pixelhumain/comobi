export const capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const nameToCollection = function(name) {
  return this[capitalize(name)];
};
