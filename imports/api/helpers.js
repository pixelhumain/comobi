export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const nameToCollection = (name) => {
  return this[capitalize(name)];
};

export const encodeString = (str) => {
  return encodeURIComponent(str).replace(/\*/g, "%2A");
};
