var graphQl = require('/lib/graphql');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

var form = require('./form');

var graphQlUserItem = require('./userItem');

exports.SchemaType = schemaGenerator.createInterfaceType({
    name: 'Schema',
    description: 'Domain representation of a content schema',
    typeResolver: function(source) {
        //TODO
        return "ContentType" === source.type
               ? exports.ContentTypeSchemaType
               : "Mixin" === source.type ? exports.MixinSchemaType : "Xdata" === source.type ? exports.XDataSchemaType : null;
    },
    fields: {
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
        type: {
            type: graphQl.GraphQLString
        },
        resource: {
            type: graphQl.GraphQLString
        },
        modifiedTime: {
            type: graphQl.DateTime
        },
        createdTime: {
            type: graphQl.DateTime
        },
    }
});

exports.ContentTypeSchemaType = schemaGenerator.createObjectType({
    name: 'ContentType',
    description: 'Domain representation of a content type schema',
    interfaces:[exports.SchemaType],
    fields: {
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.name;
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
        createdTime: {
            type: graphQl.DateTime,
            resolve: function (env) {
                return env.source.createdTime;
            }
        },
        modifiedTime: {
            type: graphQl.DateTime,
            resolve: function (env) {
                return env.source.createdTime;
            }
        },
    }
});
exports.MixinSchemaType = schemaGenerator.createObjectType({
    name: 'Mixin',
    description: 'Domain representation of a mixin schema',
    interfaces:[exports.SchemaType],
    fields: {
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.name;
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
        createdTime: {
            type: graphQl.DateTime,
            resolve: function (env) {
                return env.source.createdTime;
            }
        },
        modifiedTime: {
            type: graphQl.DateTime,
            resolve: function (env) {
                return env.source.createdTime;
            }
        },
    }
});

exports.XDataSchemaType = schemaGenerator.createObjectType({
    name: 'XData',
    description: 'Domain representation of a xdata schema',
    interfaces:[exports.SchemaType],
    fields: {
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.name;
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
        createdTime: {
            type: graphQl.DateTime,
            resolve: function (env) {
                return env.source.createdTime;
            }
        },
        modifiedTime: {
            type: graphQl.DateTime,
            resolve: function (env) {
                return env.source.createdTime;
            }
        },
    }
});

graphQlUserItem.typeResolverMap.contentTypeSchemaType = exports.ContentTypeSchemaType;
graphQlUserItem.typeResolverMap.mixinSchemaType = exports.MixinSchemaType;
graphQlUserItem.typeResolverMap.xdataSchemaType = exports.XDataSchemaType;
