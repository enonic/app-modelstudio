var component = require('../types/objects/component')
var schema = require('../types/objects/schema')

module.exports = {
    query: require('./query'),
    mutation: require('./mutation'),
    dictionary: [
        component.PartComponentType,
        component.LayoutComponentType,
        component.PageComponentType,
        schema.XDataSchemaType,
        schema.MixinSchemaType,
        schema.ContentTypeSchemaType]
};
