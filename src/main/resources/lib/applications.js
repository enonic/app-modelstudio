var common = require('./common');
var appLib = require('/lib/xp/app');

module.exports = {
    list: function () {
        return appLib.list();
    },
    create: function (params) {
        var key = common.required(params, 'key');
        var displayName = params.displayName;

        return appLib.createVirtualApplication({
            key: key,
            displayName: displayName
        });
    },
    // update: function (params) {
    //     var name = common.required(params, 'name');
    //     var type = common.required(params, 'type');
    //
    //     return schemaLib.updateComponent({
    //         key: name,
    //         type: type,
    //         resource: params.resource
    //     });
    // },
    delete: function (params) {
        var result = appLib.deleteVirtualApplication({
            key: params.key
        });

        return {id: params.key, result: result};

    }
};
