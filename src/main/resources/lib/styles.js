const common = require('./common');
var schemaLib = require('/lib/xp/schema');

module.exports = {
    get: function (params) {
        var key = common.required(params, 'key');

        return schemaLib.getStyles({
            key: key
        });
    }
}
