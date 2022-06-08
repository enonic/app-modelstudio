function isString(str) {
    return (typeof str === 'string') || (str instanceof String);
}

exports.required = function (params, name, skipTrimming) {
    var value = params[name];
    if (value === undefined || value === null) {
        throw new Error("Parameter '" + name + "' is required");
    }
    if (!skipTrimming && isString(value)) {
        return value.trim();
    }
    return value;
};
