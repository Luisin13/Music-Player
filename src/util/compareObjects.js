module.exports = (firstObject, secondObject) => {
  let equals = true;
  for (const propertyName in firstObject) {
    if (firstObject[propertyName] !== secondObject[propertyName]) {
      equals = false;
      break;
    }
  }
  return equals;
};
