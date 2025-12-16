"use strict";
exports.__esModule = true;
exports["default"] = (function (name) {
    // remove all characters other than [space, a-z, 0-9]
    var split = name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, '')
        .split(' ');
    var camelCaseName = '';
    for (var _i = 0, split_1 = split; _i < split_1.length; _i++) {
        var word = split_1[_i];
        camelCaseName += word.charAt(0).toUpperCase() + word.slice(1);
    }
    return camelCaseName.charAt(0).toLowerCase() + camelCaseName.slice(1);
});
