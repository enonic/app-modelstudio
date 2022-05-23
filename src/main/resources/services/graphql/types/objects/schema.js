var graphQl = require('/lib/graphql');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;
var graphQlUserItem = require('./userItem');

var iconResolver = __.newBean('com.enonic.xp.app.users.lib.IconResourceResolver');

exports.SchemaType = schemaGenerator.createInterfaceType({
    name: 'Schema',
    description: 'Domain representation of a content schema',
    typeResolver: function(source) {
        //TODO
        return "Content_Type" === source.type
               ? exports.ContentTypeSchemaType
               : "Mixin" === source.type ? exports.MixinSchemaType : "XData" === source.type ? exports.XDataSchemaType : null;
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
        icon: {
            type: graphQl.GraphQLString
        }
    }
});

exports.ContentTypeSchemaType = schemaGenerator.createObjectType({
    name: 'ContentType',
    description: 'Domain representation of a content type schema',
    interfaces: [exports.SchemaType],
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
        icon: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                var elements = env.source.name.split(':');
                return iconResolver.getSchemaIcon(elements[0], elements[1], '/site/content-types');
            }
        }
    }
});
exports.MixinSchemaType = schemaGenerator.createObjectType({
    name: 'Mixin',
    description: 'Domain representation of a mixin schema',
    interfaces: [exports.SchemaType],
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
        icon: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                var elements = env.source.name.split(':');
                return iconResolver.getSchemaIcon(elements[0], elements[1], '/site/mixins');
            }
        }
    }
});

exports.XDataSchemaType = schemaGenerator.createObjectType({
    name: 'XData',
    description: 'Domain representation of a xdata schema',
    interfaces: [exports.SchemaType],
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
        icon: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                var elements = env.source.name.split(':');
                return iconResolver.getSchemaIcon(elements[0], elements[1], '/site/x-data');
            }
        }
    }
});

exports.SchemaDeleteType = schemaGenerator.createObjectType({
    name: 'SchemaDelete',
    description: 'Result of a Schema delete operation',
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


graphQlUserItem.typeResolverMap.contentTypeSchemaType = exports.ContentTypeSchemaType;
graphQlUserItem.typeResolverMap.mixinSchemaType = exports.MixinSchemaType;
graphQlUserItem.typeResolverMap.xdataSchemaType = exports.XDataSchemaType;
graphQlUserItem.typeResolverMap.schemaDeleteType = exports.SchemaDeleteType;
