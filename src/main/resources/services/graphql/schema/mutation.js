var graphQl = require('/lib/graphql');

var schemas = require('/lib/schemas');
var components = require('/lib/components');
var applications = require('/lib/applications');

var schemaGenerator = require('../schemaUtil').schemaGenerator;

var graphQlObjectTypes = require('../types').objects;

module.exports = schemaGenerator.createObjectType({
    name: 'Mutation',
    fields: {
        createSchema: {
            type: graphQlObjectTypes.SchemaType,
            args: {
                name: graphQl.nonNull(graphQl.GraphQLString),
                type: graphQl.nonNull(graphQl.GraphQLString),
                resource: graphQl.GraphQLString,

            },
            resolve: function (env) {
                return schemas.create({
                    name: env.args.name,
                    type: env.args.type,
                    resource: env.args.resource,
                });
            }
        },
        createComponent: {
            type: graphQlObjectTypes.ComponentType,
            args: {
                name: graphQl.nonNull(graphQl.GraphQLString),
                type: graphQl.nonNull(graphQl.GraphQLString),
                resource: graphQl.GraphQLString,

            },
            resolve: function (env) {
                return components.create({
                    name: env.args.name,
                    type: env.args.type,
                    resource: env.args.resource,
                });
            }
        },
        createApplication: {
            type: graphQlObjectTypes.ApplicationType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                return applications.create({
                    key: env.args.key
                });
            }
        },
        updateSchema: {
            type: graphQlObjectTypes.SchemaType,
            args: {
                name: graphQl.nonNull(graphQl.GraphQLString),
                type: graphQl.nonNull(graphQl.GraphQLString),
                resource: graphQl.GraphQLString,

            },
            resolve: function (env) {
                return schemas.update({
                    name: env.args.name,
                    type: env.args.type,
                    resource: env.args.resource,
                });
            }
        },
        updateComponent: {
            type: graphQlObjectTypes.ComponentType,
            args: {
                name: graphQl.nonNull(graphQl.GraphQLString),
                type: graphQl.nonNull(graphQl.GraphQLString),
                resource: graphQl.GraphQLString,

            },
            resolve: function (env) {
                return components.update({
                    name: env.args.name,
                    type: env.args.type,
                    resource: env.args.resource,
                });
            }
        },
        // updateApplication: {
        //     type: graphQlObjectTypes.ApplicationType,
        //     args: {
        //         key: graphQl.nonNull(graphQl.GraphQLString),
        //         displayName: graphQl.nonNull(graphQl.GraphQLString)
        //
        //     },
        //     resolve: function (env) {
        //         return applications.update({
        //             key: env.args.key,
        //             displayName: env.args.displayName
        //         });
        //     }
        // },
        deleteSchemas: {
            type: graphQl.list(graphQlObjectTypes.SchemaDeleteType),
            args: {
                ids: graphQl.list(graphQl.GraphQLString),
                type: graphQl.GraphQLString
            },
            resolve: function (env) {
                return schemas.delete({names: env.args.ids, type: env.args.type});
            }
        },
        deleteComponents: {
            type: graphQl.list(graphQlObjectTypes.ComponentDeleteType),
            args: {
                ids: graphQl.list(graphQl.GraphQLString),
                type: graphQl.GraphQLString
            },
            resolve: function (env) {
                return components.delete({names: env.args.ids, type: env.args.type});
            }
        },
        deleteApplication: {
            type: graphQlObjectTypes.ApplicationDeleteType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                return applications.delete({key: env.args.key});
            }
        }
    }
});
