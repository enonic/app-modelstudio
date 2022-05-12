var graphQl = require('/lib/graphql');
var authLib = require('/lib/auth');

var idproviders = require('/lib/idproviders');
var principals = require('/lib/principals');
var useritems = require('/lib/useritems');
var repositories = require('/lib/repositories');
// var dynamicSchemas = require('/lib/dynamicSchemas');
var applications = require('/lib/applications');

var schemas = require('/lib/schemas');
var components = require('/lib/components');
var sites = require('/lib/sites');
var styles = require('/lib/styles');

var schemaGenerator = require('../schemaUtil').schemaGenerator;

var graphQlObjectTypes = require('../types').objects;
var graphQlEnums = require('../types').enums;


module.exports = schemaGenerator.createObjectType({
    name: 'Query',
    fields: {
        components: {
            type: graphQl.list(graphQlObjectTypes.ComponentType),
            args: {
                key: graphQl.GraphQLString,
                type: graphQlEnums.ComponentTypeEnum
            },
            resolve: function (env) {
                var key = env.args.key;
                var type = env.args.type;

                return components.list({key, type});
            }
        },
        schemas: {
            type: graphQl.list(graphQlObjectTypes.SchemaType),
            args: {
                key: graphQl.GraphQLString,
                type: graphQlEnums.SchemaTypeEnum
            },
            resolve: function (env) {
                var key = env.args.key;
                var type = env.args.type;

                return schemas.list({key, type});
            }
        },
        applications: {
            type: graphQl.list(graphQlObjectTypes.ApplicationType),
            args: {
            },
            resolve: function (env) {
                return applications.list();
            }
        },
        site: {
            type: graphQlObjectTypes.SiteType,
            args: {
                key: graphQl.GraphQLString,
            },
            resolve: function (env) {
                var key = env.args.key;

                return sites.get({key});
            }
        },
        styles: {
            type: graphQlObjectTypes.StylesType,
            args: {
                key: graphQl.GraphQLString,
            },
            resolve: function (env) {
                var key = env.args.key;

                return styles.get({key});
            }
        },
        idProviders: {
            type: graphQl.list(graphQlObjectTypes.IdProviderType),
            resolve: function () {
                return idproviders.list();
            }
        },
        idProvider: {
            type: graphQlObjectTypes.IdProviderType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                var key = env.args.key;
                return idproviders.getByKey(key);
            }
        },
        defaultIdProvider: {
            type: graphQlObjectTypes.IdProviderType,
            resolve: function () {
                return idproviders.getDefault();
            }
        },
        principalsConnection: {
            type: graphQlObjectTypes.PrincipalConnectionType,
            args: {
                idprovider: graphQl.GraphQLString,
                types: graphQl.list(graphQlEnums.PrincipalTypeEnum),
                query: graphQl.GraphQLString,
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt,
                sort: graphQl.GraphQLString
            },
            resolve: function (env) {
                var idprovider = env.args.idprovider || 'system';
                var types = env.args.types || principals.Type.all();
                var query = env.args.query;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return principals.list(
                    idprovider,
                    types,
                    query,
                    start,
                    count,
                    sort
                );
            }
        },
        principal: {
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
            },
            resolve: function (env) {
                var key = env.args.key;
                return principals.getByKeys(key);
            }
        },
        principals: {
            type: graphQl.list(graphQlObjectTypes.PrincipalType),
            args: {
                keys: graphQl.nonNull(graphQl.list(graphQl.GraphQLString))
            },
            resolve: function (env) {
                var keys = env.args.keys;
                return principals.getByKeys(keys);
            }
        },
        userItemsConnection: {
            type: graphQlObjectTypes.UserItemConnectionType,
            args: {
                types: graphQl.list(graphQlEnums.UserItemTypeEnum),
                query: graphQl.GraphQLString,
                itemIds: graphQl.list(graphQl.GraphQLString),
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt
            },
            resolve: function (env) {
                var types = env.args.types;
                var query = env.args.query;
                var itemIds = env.args.itemIds;
                var count = env.args.count || Number.MAX_SAFE_INTEGER;
                var start = env.args.start || 0;
                return useritems.list(types, query, itemIds, start, count);
            }
        },
        types: {
            type: graphQlObjectTypes.TypesType,
            args: {
                query: graphQl.GraphQLString,
                itemIds: graphQl.list(graphQl.GraphQLString),
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt
            },
            resolve: function (env) {
                var query = env.args.query;
                var itemIds = env.args.itemIds;
                var count = env.args.count || Number.MAX_SAFE_INTEGER;
                var start = env.args.start || 0;
                return useritems.list(null, query, itemIds, start, count);
            }
        },
        repository: {
            type: graphQlObjectTypes.RepositoryType,
            args: {
                id: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                if (!authLib.isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var id = env.args.id;
                return repositories.getById(id);
            }
        },
        repositories: {
            type: graphQl.list(graphQlObjectTypes.RepositoryType),
            args: {
                query: graphQl.GraphQLString,
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt,
                sort: graphQlEnums.SortModeEnum
            },
            resolve: function (env) {
                if (!authLib.isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var query = env.args.query;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return repositories.list(query, start, count, sort);
            }
        }
    }
});
