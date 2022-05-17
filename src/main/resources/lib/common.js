var nodeLib = require('/lib/xp/node');
var schemaLib = require('/lib/xp/schema');
var appLib = require('/lib/xp/app');

var namePrettyfier = Java.type('com.enonic.xp.name.NamePrettyfier');

var REPO_NAME = 'system-repo';
var REPO_BRANCH = 'master';
var MAX_COUNT = -1;
var SYSTEM_ADMIN = 'role:system.admin';

var UserItemType = exports.UserItemType = {
    ROLE: 'ROLE',
    USER: 'USER',
    GROUP: 'GROUP',
    ID_PROVIDER: 'ID_PROVIDER'
};
exports.UserItemType.all = function () {
    return [
        UserItemType.ROLE,
        UserItemType.USER,
        UserItemType.GROUP,
        UserItemType.ID_PROVIDER
    ];
};

var PrincipalType = exports.PrincipalType = {
    ROLE: 'ROLE',
    USER: 'USER',
    GROUP: 'GROUP'
};

var ComponentType = exports.ComponentType = {
    PART: 'PART',
    PAGE: 'PAGE',
    LAYOUT: 'LAYOUT'
};
exports.ComponentType.all = function () {
    return [
        ComponentType.PART,
        ComponentType.PAGE,
        ComponentType.LAYOUT
    ];
};

var SchemaType = exports.SchemaType = {
    X_DATA: 'XDATA',
    MIXIN: 'MIXIN',
    CONTENT_TYPE: 'CONTENTTYPE'
};

exports.SchemaType.all = function () {
    return [
        SchemaType.X_DATA,
        SchemaType.MIXIN,
        SchemaType.CONTENT_TYPE
    ];
};

exports.PrincipalType.all = function () {
    return [PrincipalType.ROLE, PrincipalType.USER, PrincipalType.GROUP];
};


exports.singleOrArray = function (value) {
    return value && value.length === 1 ? value[0] : value;
};

function isString(str) {
    return (typeof str === 'string') || (str instanceof String);
}

exports.isString = isString;

exports.refresh = function (repo) {
    newConnection(repo).refresh('SEARCH');
};

exports.required = function (params, name, skipTrimming) {
    var value = params[name];
    if (value === undefined || value === null) {
        throw new Error("Parameter '" + name + "' is required");
    }
    if (!skipTrimming && isString(value)) {
        return value.trim();
    }
    return value;
};

exports.default = function (params, name, defaultValue) {
    var value = params[name];
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
};

exports.getByIds = function (ids, repo) {
    return newConnection(repo).get(ids);
};

exports.delete = function (ids, repo) {
    return newConnection(repo).delete(ids);
};

exports.keysToPaths = function (keys) {
    return keys.map(function (key) {
        if (isIdProvider(key)) {
            return '/identity/' + idProviderFromKey(key);
        }
        if (isUser(key)) {
            return (
                '/identity/' +
                idProviderFromKey(key) +
                '/users/' +
                nameFromKey(key)
            );
        }
        if (isGroup(key)) {
            return (
                '/identity/' +
                idProviderFromKey(key) +
                '/groups/' +
                nameFromKey(key)
            );
        }
        if (isRole(key)) {
            return '/identity/roles/' + nameFromKey(key);
        }
        return '';
    });
};

// exports.keysToPaths = function (keys) {
//     return keys.map(function (key) {
//         if (isPart(key)) {
//             return (
//                 '/' + appKeyFromKey(key) +
//                 '/' + componentTypeFromKey(key) + '/' +
//                 nameFromKey(key) + '/' + nameFromKey(key) + '.' + extensionFromKey(key)
//             );
//         }
//         if (isLayout(key)) {
//             return (
//                 '/' + appKeyFromKey(key) +
//                 '/' + componentTypeFromKey(key) + '/' +
//                 nameFromKey(key) + '/' + nameFromKey(key) + '.' + extensionFromKey(key)
//             );
//         }
//
//         if (isPage(key)) {
//             return (
//                 '/' + appKeyFromKey(key) +
//                 '/' + componentTypeFromKey(key) + '/' +
//                 nameFromKey(key) + '/' + nameFromKey(key) + '.' + extensionFromKey(key)
//             );
//         }
//         return '';
//     });
// };

exports.isUser = function isUser(key) {
    return exports.typeFromKey(key).toUpperCase() === PrincipalType.USER;
};

exports.isGroup = function isGroup(key) {
    return exports.typeFromKey(key).toUpperCase() === PrincipalType.GROUP;
};

exports.isRole = function isRole(key) {
    return exports.typeFromKey(key).toUpperCase() === PrincipalType.ROLE;
};

// exports.isPart = function isPart(key) {
//     return exports.typeFromKey(key).toUpperCase() === ComponentType.PART;
// };
//
// exports.isLayout = function isLayout(key) {
//     return exports.typeFromKey(key).toUpperCase() === ComponentType.LAYOUT;
// };
//
// exports.isPage = function isPage(key) {
//     return exports.typeFromKey(key).toUpperCase() === ComponentType.PAGE;
// };

exports.isIdProvider = function isIdProvider(key) {
    return splitKey(key).length === 1;
};

exports.isSystemAdmin = function isSystemAdmin(key) {
    return key === SYSTEM_ADMIN;
}

exports.createQueryByField = function (field, values) {
    if (!values || !field) {
        return null;
    }
    if (values instanceof Array) {
        return String(field) + ' IN (' + serializeValues(values) + ')';
    }
    return String(field) + '=' + serializeValue(values);
};

function serializeValues(values) {
    return values ? values.map(serializeValue).join(',') : '';
}

function serializeValue(value) {
    return typeof value === 'string' ? '"' + value + '"' : value;
}

exports.extensionFromMimeType = function (mimeType) {
    var ext = '';
    if (mimeType.indexOf('image/png') > -1) {
        ext = '.png';
    } else if (
        mimeType.indexOf('image/jpg') > -1 ||
        mimeType.indexOf('image/jpeg') > -1
    ) {
        ext = '.jpg';
    } else if (mimeType.indexOf('image/gif') > -1) {
        ext = '.gif';
    } else if (mimeType.indexOf('image/svg+xml') > -1) {
        ext = '.svg';
    }
    return ext;
};

function splitKey(key) {
    var parts = key && key.split(':');
    var isRoleType =
        parts &&
        parts.length === 2 &&
        parts[0].toUpperCase() === PrincipalType.ROLE;
    var isIdProviderType = parts && parts.length === 1;
    if (!isRoleType && !isIdProviderType && !(parts && parts.length === 3)) {
        throw new Error('Invalid principal key [' + key + ']');
    }
    return parts;
}

exports.idProviderFromKey = function idProviderFromKey(key) {
    var parts = splitKey(key);
    if (parts[0].toUpperCase() === PrincipalType.ROLE) {
        throw new Error(
            "Principal keys of type role can't have idprovider [" + key + ']'
        );
    }
    return parts.length === 1 ? parts[0] : parts[1];
};

exports.nameFromKey = function nameFromKey(key) {
    var parts = splitKey(key);
    if (parts.length === 1) {
        throw new Error("Key don't have name [" + key + ']');
    }
    return parts[0].toUpperCase() !== PrincipalType.ROLE ? parts[2] : parts[1];
};

exports.typeFromKey = function typeFromKey(key) {
    var parts = splitKey(key);
    if (parts.length === 1) {
        throw new Error("Key don't have type [" + key + ']');
    }
    return parts[0];
};

exports.prettifyName = function (text) {
    return namePrettyfier.create(text);
};

exports.querySingle = function (query, repo) {
    var results = queryAll({
        start: 0,
        count: 1,
        query: query
    }, repo);

    return results.total === 1 ? results.hits[0] : null;
};

exports.create = function (params, repo) {
    return newConnection(repo).create(params);
};

exports.update = function (params, repo) {
    return newConnection(repo).modify(params);
};

exports.queryAll = function queryAll(params, repo) {
    var start = params.start || 0;
    var count = params.count == null ? MAX_COUNT : params.count;

    var repoConn = newConnection(repo);
    var queryResult = repoConn.query({
        start: start,
        count: count,
        query: params.query,
        sort: params.sort,
        aggregations: params.aggregations
    });

    var hits = [];
    if (queryResult.count > 0) {
        var ids = queryResult.hits.map(function (hit) {
            return hit.id;
        });
        hits = repoConn.get(ids);
    }

    return {
        total: queryResult.total,
        start: start,
        count: count,
        hits: [].concat(hits),
        aggregations: queryResult.aggregations
    };
};

// exports.listComponents = function listComponents(params) {
//     var applicationKey = params.key;
//     var componentType = params.type;
//
//     var queryResult = schemaLib.listComponents({
//         key: applicationKey,
//         type: componentType
//     });
//
//     return queryResult;
// };

// exports.listSchemas = function listSchemas(params) {
//     var applicationKey = params.key;
//     var schemaType = params.type;
//
//     var queryResult = schemaLib.listSchemas({
//         key: applicationKey,
//         type: schemaType
//     });
//
//     return queryResult;
// };

exports.getSite = function getSite(params) {
    var applicationKey = params.key;

    return schemaLib.getSite({
        key: applicationKey
    });
};

exports.getStyles = function getStyles(params) {
    var applicationKey = params.key;

    return schemaLib.getStyles({
        key: applicationKey
    });
};

// exports.listApps = function listApps() {
//
//     return appLib.list(
//     );
// };

function newConnection(repo, branch) {
    return nodeLib.connect({
        repoId: repo || REPO_NAME,
        branch: branch || REPO_BRANCH
    });
}

exports.newConnection = newConnection;