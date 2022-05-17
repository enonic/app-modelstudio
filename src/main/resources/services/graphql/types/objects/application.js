var graphQl = require('/lib/graphql');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

var graphQlUserItem = require('./userItem');

exports.ApplicationType = schemaGenerator.createObjectType({
    name: 'Application',
    description: 'Domain representation of an application',
    fields: {

        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key;
            }
        },
        displayName: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        vendorName: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.vendorName;
            }
        },
        vendorUrl: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.vendorUrl;
            }
        },
        url: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.url;
            }
        },
        version: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.version;
            }
        },
        minSystemVersion: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.minSystemVersion;
            }
        },
        maxSystemVersion: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.maxSystemVersion;
            }
        },
        modifiedTime: {
            type: graphQl.DateTime,
            resolve: function (env) {
                return env.source.modifiedTime;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
            }
        },
        icon: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.icon;
            }
        }
    }
});

exports.ApplicationDeleteType = schemaGenerator.createObjectType({
    name: 'ApplicationDelete',
    description: 'Result of a Application delete operation',
    fields: {
        id: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.id;
            }
        },
        result: {
            type: graphQl.GraphQLBoolean,
            resolve: function (env) {
                return env.source.result;
            }
        }
    }
});

graphQlUserItem.typeResolverMap.applicationType = exports.ApplicationType;
graphQlUserItem.typeResolverMap.applicationDeleteType = exports.ApplicationDeleteType;
