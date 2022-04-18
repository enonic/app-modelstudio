var graphQlConnection = require('./connection');

var graphQlIdProvider = require('./idProvider');
var graphQlPrincipal = require('./principal');
var graphQlUserItem = require('./userItem');
var graphQlTypes = require('./types');
var graphQlRepository = require('./repository');
var graphQlComponent = require('./component');
var graphQlSchema = require('./schema');
var graphQlApplication = require('./application');

module.exports = {
    ComponentType: graphQlComponent.ComponentType,
    SchemaType: graphQlSchema.SchemaType,
    ApplicationType: graphQlApplication.ApplicationType,
    IdProviderType: graphQlIdProvider.IdProviderType,
    IdProviderDeleteType: graphQlIdProvider.IdProviderDeleteType,
    PrincipalType: graphQlPrincipal.PrincipalType,
    PrincipalDeleteType: graphQlPrincipal.PrincipalDeleteType,
    TypesType: graphQlTypes.TypesType,
    PrincipalConnectionType: graphQlConnection.createConnectionType(
        'Principal',
        graphQlPrincipal.PrincipalType
    ),
    UserItemConnectionType: graphQlConnection.createConnectionType(
        'UserItem',
        graphQlUserItem.UserItemType
    ),
    RepositoryType: graphQlRepository.RepositoryType
};
