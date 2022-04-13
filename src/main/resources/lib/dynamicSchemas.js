var common = require('./common');

    module.exports = {
    // getByKeys: function (keys) {
    //     var noKeys = keys == null || (keys instanceof Array && keys.length === 0);
    //
    //     // users and groups have their keys as _id, but roles have them stored as key
    //     var principals = noKeys ? [] : common.queryAll({
    //         query:
    //             common.createQueryByField('_id', keys) +
    //             ' OR ' +
    //             common.createQueryByField('key', keys)
    //     }).hits;
    //
    //     return keys instanceof Array ? principals : common.singleOrArray(principals);
    // },

    getByKey: function (key) {
        const paths = common.keysToPaths();
        return common.getByPaths(paths[0]);
    },
    getMemberships: function (key, transitive) {
        return authLib.getMemberships(key, transitive);
    },
    addMemberships: function (key, memberships) {
        var addMms = [].concat(memberships).map(function (current) {
            module.exports.addMembers(current, key);
            return current;
        });
        return addMms;
    },
    removeMemberships: function (key, memberships) {
        var removeMms = [].concat(memberships).map(function (current) {
            module.exports.removeMembers(current, key);
            return current;
        });
        return removeMms;
    },
    updateMemberships: function (key, addMms, removeMms) {
        if (addMms && addMms.length > 0) {
            module.exports.addMemberships(key, addMms);
        }
        if (removeMms && removeMms.length > 0) {
            module.exports.removeMemberships(key, removeMms);
        }
    },
    getMembers: function (key) {
        return authLib.getMembers(key);
    },
    addMembers: function (key, members) {
        try {
            authLib.addMembers(key, members);
        } catch (e) {
            log.error(
                'Could not add members ' +
                JSON.stringify(members) +
                ' to [' +
                key +
                ']',
                e
            );
        }
        return members;
    },
    removeMembers: function (key, members) {
        try {
            authLib.removeMembers(key, members);
        } catch (e) {
            log.error(
                'Could not remove members ' +
                JSON.stringify(members) +
                ' from [' +
                key +
                ']',
                e
            );
        }
        return members;
    },
    updateMembers: function (key, addMs, removeMs) {
        if (addMs && addMs.length > 0) {
            module.exports.addMembers(key, addMs);
        }
        if (removeMs && removeMs.length > 0) {
            module.exports.removeMembers(key, removeMs);
        }
    },
    list: function (key, type) {
        return common.listComponents({
            key: key,
            type: type
        });
    },
    delete: function (keys) {
        return keys.map(function (key) {
            try {
                var deleted = authLib.deletePrincipal(key);
                return {
                    key: key,
                    deleted: deleted,
                    reason: deleted ? '' : 'Principal [' + key + '] could not be deleted'
                };
            } catch (e) {
                return {
                    key: key,
                    deleted: false,
                    reason: e.message
                };
            }
        });
    },
    Type: common.PrincipalType
};

