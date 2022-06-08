var schemaGenerator = require('../schemaUtil').schemaGenerator;

exports.ComponentTypeEnum = schemaGenerator.createEnumType({
    name: 'ComponentType',
    description: 'Enumeration of component types',
    values: {
        PART: 'PART',
        LAYOUT: 'LAYOUT',
        PAGE: 'PAGE'
    }
});

exports.SchemaTypeEnum = schemaGenerator.createEnumType({
    name: 'SchemaType',
    description: 'Enumeration of schema types',
    values: {
        CONTENT_TYPE: 'CONTENT_TYPE',
        MIXIN: 'MIXIN',
        XDATA: 'XDATA'
    }
});
