var graphQl = require('/lib/graphql');
var schemaGenerator = require('../../schemaUtil').schemaGenerator;

exports.StylesType = schemaGenerator.createObjectType({
    name: 'Styles',
    description: 'Domain representation of a styles.xml descriptor',
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
