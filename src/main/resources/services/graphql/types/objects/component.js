const graphQl = require('/lib/graphql');
const schemaGenerator = require('../../schemaUtil').schemaGenerator;

exports.ComponentType = schemaGenerator.createInterfaceType({
    name: 'Component',
    description: 'Domain representation of a component descriptor',
    typeResolver: function (source) {
        if('PART' === source.type) {
            return exports.PartComponentType;
        }

        if('LAYOUT' === source.type) {
            return exports.LayoutComponentType;
        }

        if('PAGE' === source.type) {
            return exports.PageComponentType;
        }
        return null;
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
        componentPath: {
            type: graphQl.GraphQLString
        },
        type: {
            type: graphQl.GraphQLString
        },
        resource: {
            type: graphQl.GraphQLString
        }
    }
});

exports.PartComponentType = schemaGenerator.createObjectType({
    name: 'Part',
    description: 'Domain representation of a part component descriptor',
    interfaces: [exports.ComponentType],
    fields: {
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
        }
    }
});

exports.LayoutComponentType = schemaGenerator.createObjectType({
    name: 'Layout',
    description: 'Domain representation of a layout component descriptor',
    interfaces: [exports.ComponentType],
    fields: {
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
        }
    }
});

exports.PageComponentType = schemaGenerator.createObjectType({
    name: 'Page',
    description: 'Domain representation of a page component descriptor',
    interfaces: [exports.ComponentType],
    fields: {
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

