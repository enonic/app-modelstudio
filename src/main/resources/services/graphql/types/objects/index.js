var graphQlComponent = require('./component');
var graphQlSchema = require('./schema');
var graphQlApplication = require('./application');
var graphQlSite = require('./site');
var graphQlStyles = require('./styles');

module.exports = {
    SchemaType: graphQlSchema.SchemaType,
    SchemaDeleteType: graphQlSchema.SchemaDeleteType,
    ComponentType: graphQlComponent.ComponentType,
    ComponentDeleteType: graphQlSchema.SchemaDeleteType,
    ApplicationType: graphQlApplication.ApplicationType,
    ApplicationDeleteType: graphQlApplication.ApplicationDeleteType,
    SiteType: graphQlSite.SiteType,
    StylesType: graphQlStyles.StylesType
};
