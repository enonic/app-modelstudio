var graphQl = require('/lib/graphql');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

var graphQlUserItem = require('./userItem');

exports.FormType = schemaGenerator.createObjectType({
    name: 'Form',
    description: 'Domain representation of a form',
    fields: {
        config: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return null;
            }
        }
    }
});
graphQlUserItem.typeResolverMap.FormType = exports.FormType;
