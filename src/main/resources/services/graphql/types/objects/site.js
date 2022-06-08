var graphQl = require('/lib/graphql');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

exports.SiteType = schemaGenerator.createObjectType({
    name: 'Site',
    description: 'Domain representation of a site.xml descriptor',
    fields: {
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key;
            }
        },
        resource: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.resource;
            }
        }
    }
});
