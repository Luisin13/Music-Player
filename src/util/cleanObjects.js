const orderObjects = require("./orderObjects");

module.exports = (object) => {
  for (const propName in object) {
    if (
      object[propName] === null ||
      object[propName] === undefined ||
      object[propName].length === 0 ||
      object[propName] === ""
    ) {
      delete object[propName];
    }
  }
  return orderObjects(object);
};
