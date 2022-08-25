const common = require('./common');
const schemaLib = require('/lib/xp/schema');

module.exports = {
    get: function (params) {
        const key = common.required(params, 'key');

        return schemaLib.getStyles({
            application: key
        });
    }
}
