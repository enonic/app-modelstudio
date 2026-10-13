var common = require('./common');
var appLib = require('/lib/xp/app');

module.exports = {
    list: function () {
        return appLib.list().map(function (application) {
            var descriptor = appLib.getDescriptor({key: application.key});

            return {
                key: application.key,
                displayName: descriptor ? descriptor.title : null,
                description: descriptor ? descriptor.description : null,
                vendorName: descriptor ? descriptor.vendorName : null,
                vendorUrl: descriptor ? descriptor.vendorUrl : null,
                url: descriptor ? descriptor.url : null,
                version: application.version,
                minSystemVersion: application.minSystemVersion,
                maxSystemVersion: application.maxSystemVersion,
                modifiedTime: application.modifiedTime
            };
        });
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
