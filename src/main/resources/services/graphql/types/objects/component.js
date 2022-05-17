var graphQl = require('/lib/graphql');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

var form = require('./form');

var graphQlUserItem = require('./userItem');

exports.ComponentType = schemaGenerator.createInterfaceType({
    name: 'Component',
    description: 'Domain representation of a component descriptor',
    typeResolver: function (source) {
        if('Part' === source.type) {
            return exports.PartComponentType;
        }

        if('Layout' === source.type) {
            return exports.LayoutComponentType;
        }

        if('Page' === source.type) {
            return exports.PageComponentType;
        }
        return null;
    },
    fields: {
        // key: {
        //     type: graphQl.GraphQLString
        // },
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
        resource: {
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
    interfaces: [exports.ComponentType],
    fields: {
        // key: {
        //     type: graphQl.GraphQLString,
        //     resolve: function (env) {
        //         return env.source.key;
        //     }
        // },
        name: {
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

exports.LayoutComponentType = schemaGenerator.createObjectType({
    name: 'Layout',
    description: 'Domain representation of a layout component descriptor',
    interfaces: [exports.ComponentType],
    fields: {
        // key: {
        //     type: graphQl.GraphQLString,
        //     resolve: function (env) {
        //         return env.source.key;
        //     }
        // },
        name: {
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

exports.PageComponentType = schemaGenerator.createObjectType({
    name: 'Page',
    description: 'Domain representation of a page component descriptor',
    interfaces: [exports.ComponentType],
    fields: {
        // key: {
        //     type: graphQl.GraphQLString,
        //     resolve: function (env) {
        //         return env.source.key;
        //     }
        // },
        name: {
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

exports.ComponentDeleteType = schemaGenerator.createObjectType({
    name: 'ComponentDelete',
    description: 'Result of a Component delete operation',
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

// graphQlUserItem.typeResolverMap.partComponentType = exports.PartComponentType;
// graphQlUserItem.typeResolverMap.layoutComponentType = exports.LayoutComponentType;
// graphQlUserItem.typeResolverMap.componentType = exports.ComponentType;
