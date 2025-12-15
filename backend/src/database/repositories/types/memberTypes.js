"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMemberMergeSuggestionsType = exports.mapUsernameToIdentities = exports.mapSingleUsernameToIdentity = void 0;
const mapSingleUsernameToIdentity = (usernameOrIdentity) => {
    if (typeof usernameOrIdentity === 'string') {
        return {
            username: usernameOrIdentity,
        };
    }
    if (typeof usernameOrIdentity === 'object') {
        return usernameOrIdentity;
    }
    throw new Error(`Unknown username type: ${typeof usernameOrIdentity}: ${usernameOrIdentity}`);
};
exports.mapSingleUsernameToIdentity = mapSingleUsernameToIdentity;
const mapUsernameToIdentities = (username, platform) => {
    const mapped = {};
    if (typeof username === 'string') {
        if (!platform) {
            throw new Error('Platform is required when username is a string');
        }
        mapped[platform] = [(0, exports.mapSingleUsernameToIdentity)(username)];
    }
    else {
        for (const platform of Object.keys(username)) {
            const data = username[platform];
            if (Array.isArray(data)) {
                const identities = [];
                for (const entry of data) {
                    identities.push((0, exports.mapSingleUsernameToIdentity)(entry));
                }
                mapped[platform] = identities;
            }
            else {
                mapped[platform] = [(0, exports.mapSingleUsernameToIdentity)(data)];
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
//# sourceMappingURL=memberTypes.js.map