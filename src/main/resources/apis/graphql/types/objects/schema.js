const graphQl = require('/lib/graphql');
const schemaGenerator = require('../../schemaUtil').schemaGenerator;
const iconResolver = __.newBean('com.enonic.xp.app.users.lib.IconResourceResolver');

exports.SchemaType = schemaGenerator.createInterfaceType({
    name: 'Schema',
    description: 'Domain representation of a content schema',
    typeResolver: function(source) {
        //TODO
        return "CONTENT_TYPE" === source.type
               ? exports.ContentTypeSchemaType
               : "FORM_FRAGMENT" === source.type ? exports.FormFragmentSchemaType : "MIXIN" === source.type ? exports.MixinSchemaType : null;
    },
    fields: {
        name: {
            type: graphQl.GraphQLString
        },
        displayName: {
            type: graphQl.GraphQLString
        },
        description: {
            type: graphQl.GraphQLString
        },
        type: {
            type: graphQl.GraphQLString
        },
        resource: {
            type: graphQl.GraphQLString
        }/*,
        icon: {
            type: graphQl.GraphQLString
        }*/
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
                return env.source.title;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
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
        icon: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                var elements = env.source.name.split(':');
                return iconResolver.getSchemaIcon(elements[0], elements[1], '/site/content-types');
            }
        }
    }
});
exports.FormFragmentSchemaType = schemaGenerator.createObjectType({
    name: 'FormFragment',
    description: 'Domain representation of a form fragment schema',
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
                return env.source.title;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
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
        icon: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                var elements = env.source.name.split(':');
                return iconResolver.getSchemaIcon(elements[0], elements[1], '/site/form-fragments');
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
                return env.source.title;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
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
        icon: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                var elements = env.source.name.split(':');
                return iconResolver.getSchemaIcon(elements[0], elements[1], '/site/mixins');
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
