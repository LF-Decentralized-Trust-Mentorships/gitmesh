"use strict";
exports.__esModule = true;
exports.IMemberMergeSuggestionsType = exports.mapUsernameToIdentities = exports.mapSingleUsernameToIdentity = void 0;
var mapSingleUsernameToIdentity = function (usernameOrIdentity) {
    if (typeof usernameOrIdentity === 'string') {
        return {
            username: usernameOrIdentity
        };
    }
    if (typeof usernameOrIdentity === 'object') {
        return usernameOrIdentity;
    }
    throw new Error("Unknown username type: ".concat(typeof usernameOrIdentity, ": ").concat(usernameOrIdentity));
};
exports.mapSingleUsernameToIdentity = mapSingleUsernameToIdentity;
var mapUsernameToIdentities = function (username, platform) {
    var mapped = {};
    if (typeof username === 'string') {
        if (!platform) {
            throw new Error('Platform is required when username is a string');
        }
        mapped[platform] = [(0, exports.mapSingleUsernameToIdentity)(username)];
    }
    else {
        for (var _i = 0, _a = Object.keys(username); _i < _a.length; _i++) {
            var platform_1 = _a[_i];
            var data = username[platform_1];
            if (Array.isArray(data)) {
                var identities = [];
                for (var _b = 0, data_1 = data; _b < data_1.length; _b++) {
                    var entry = data_1[_b];
                    identities.push((0, exports.mapSingleUsernameToIdentity)(entry));
                }
                mapped[platform_1] = identities;
            }
            else {
                mapped[platform_1] = [(0, exports.mapSingleUsernameToIdentity)(data)];
            }
        }
    }
    return mapped;
};
exports.mapUsernameToIdentities = mapUsernameToIdentities;
var IMemberMergeSuggestionsType;
(function (IMemberMergeSuggestionsType) {
    IMemberMergeSuggestionsType["USERNAME"] = "username";
    IMemberMergeSuggestionsType["EMAIL"] = "email";
    IMemberMergeSuggestionsType["SIMILARITY"] = "similarity";
})(IMemberMergeSuggestionsType = exports.IMemberMergeSuggestionsType || (exports.IMemberMergeSuggestionsType = {}));
