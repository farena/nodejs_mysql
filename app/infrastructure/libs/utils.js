/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-extend-native */

Object.defineProperty(Object.prototype, "getOnly", {
  value(fields) {
    const obj = {};
    fields.forEach((x) => {
      if (this[x] !== undefined) {
        obj[x] = this[x];
      }
    });

    return obj;
  },
});
Object.defineProperty(Object.prototype, "except", {
  value(fields) {
    const obj = JSON.parse(JSON.stringify(this));

    fields.forEach((x) => {
      if (this[x] !== undefined) {
        delete obj[x];
      }
    });

    return obj;
  },
});
Array.prototype.flatten = function (depth = null) {
  let arr = this;

  if (depth > 1) {
    arr = arr.flatten(depth - 1);
  }

  return arr.reduce((flat, next) => flat.concat(next), []);
};
Array.prototype.flatMap = function (callback, depth = null) {
  return this.flatten(depth).map(callback);
};
Array.prototype.groupBy = function (key) {
  return this.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    // eslint-disable-next-line no-param-reassign
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
};
Array.prototype.sortBy = function (attr, dir = "asc") {
  return this.sort((a, b) =>
    (dir === "asc" ? a[attr] > b[attr] : a[attr] < b[attr]) ? 1 : -1
  );
};

String.prototype.ucwords = function () {
  const str = this.toLowerCase();
  return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, (s) =>
    s.toUpperCase()
  );
};
String.prototype.capitalize = function () {
  const str = this.toLowerCase();
  return `${str[0].toUpperCase()}${str.slice(1, str.length)}`;
};
