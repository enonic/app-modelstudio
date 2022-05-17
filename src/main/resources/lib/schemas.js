var common = require('./common');
var schemaLib = require('/lib/xp/schema');

module.exports = {
    list: function (params) {
        var applicationKey = params.key;
        var schemaType = params.type;

        return schemaLib.listSchemas({
            key: applicationKey,
            type: schemaType
        });
    },
    create: function (params) {
        var name = common.required(params, 'name');
        var type = common.required(params, 'type');

        return schemaLib.createSchema({
            name: name,
            type: type,
            resource: params.resource
        });
    },
    update: function (params) {
        var name = common.required(params, 'name');
        var type = common.required(params, 'type');

        return schemaLib.updateSchema({
            name: name,
            type: type,
            resource: params.resource
        });
    },
    delete: function (params) {
        return params.names.map(name => {
            return {
                id: name, result: schemaLib.deleteSchema({name:name, type: params.type})
            };
        })

    }
};
