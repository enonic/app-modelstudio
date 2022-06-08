var graphQl = require('/lib/graphql');

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
        }
    }
});
