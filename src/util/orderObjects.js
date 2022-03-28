module.exports = (object) => {
  return JSON.parse(
    JSON.stringify(
      Object.keys(object)
        .sort()
        .reduce((obj, key) => {
          obj[key] = object[key];
          return obj;
        }, {})
    )
  );
};
