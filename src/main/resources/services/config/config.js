/*global app, require*/

var admin = require('/lib/xp/admin');
var portal = require('/lib/xp/portal');

function handleGet() {
    var toolUri = admin.getToolUrl(app.name, 'main');
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: toolUri.substring(0, toolUri.indexOf('/' + app.name)),
            appId: app.name,
            assetsUri: portal.assetUrl({path: ''}),
            toolUri: toolUri,
            services: {
                visualization: portal.serviceUrl({ service: 'visualization'}),
                graphQlUrl: portal.serviceUrl({ service: 'graphql'}),
                reportServiceUrl: portal.serviceUrl({service: 'permissionReport'}),
                i18nUrl: portal.serviceUrl({service: 'i18n'}),
            }
        }
    };
}

exports.get = handleGet;
