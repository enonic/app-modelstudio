const common = require('./common');
const schemaLib = require('/lib/xp/schema');

module.exports = {
    list: function (params) {
        const applicationKey = params.key;
        const schemaType = params.type;

        return schemaLib.listSchemas({
            application: applicationKey,
            type: schemaType
        });
    },
    create: function (params) {
        const name = common.required(params, 'name');
        const type = common.required(params, 'type');

        return schemaLib.createSchema({
            name: name,
            type: type,
            resource: params.resource
        });
    },
    update: function (params) {
        const name = common.required(params, 'name');
        const type = common.required(params, 'type');

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
