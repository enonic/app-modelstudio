var graphQl = require('/lib/graphql');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

var form = require('./form');

var graphQlUserItem = require('./userItem');

exports.ComponentType = schemaGenerator.createInterfaceType({
    name: 'Component',
    description: 'Domain representation of a component descriptor',
    typeResolver: function(source) {
        // return source.principalType
        //        ? exports.typeResolverMap.principalType
        //        : exports.typeResolverMap.idProviderType;
        return exports.PartComponentType;
    },
    fields: {
        key: {
            type: graphQl.GraphQLString
        },
        name: {
            type: graphQl.GraphQLString
        },
        displayName: {
            type: graphQl.GraphQLString
        },
        displayNameI18nKey: {
            type: graphQl.GraphQLString
        },
        description: {
            type: graphQl.GraphQLString
        },
        descriptionI18nKey: {
            type: graphQl.GraphQLString
        },
        componentPath: {
            type: graphQl.GraphQLString
        },
        type: {
            type: graphQl.GraphQLString
        },
        config: {
            type: form.FormType
        }
    }
});

exports.PartComponentType = schemaGenerator.createObjectType({
    name: 'Part',
    description: 'Domain representation of a part component descriptor',
    interfaces:[exports.ComponentType],
    fields: {
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key;
            }
        },
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        displayName: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        displayNameI18nKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayNameI18nKey;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
            }
        },
        descriptionI18nKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.descriptionI18nKey;
            }
        },
        resource: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.resource;
            }
        },
        type: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.type;
            }
        },
        componentPath: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.componentPath;
            }
        },
        config: {
            type: form.FormType,
            resolve: function (env) {
                return null;
            }
        }
    }
});

graphQlUserItem.typeResolverMap.partComponentType = exports.PartComponentType;
