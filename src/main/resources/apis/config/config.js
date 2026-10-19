/*global app, require*/

var admin = require('/lib/xp/admin');
var portal = require('/lib/xp/portal');
var assetLib = require('/lib/enonic/asset');
var events = require('/lib/events');

function handleGet() {
    var toolUri = admin.getToolUrl(app.name, 'main');
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: toolUri.substring(0, toolUri.indexOf('/' + app.name)),
            appId: app.name,
            assetsUri: assetLib.assetUrl({path: ''}),
            toolUri: toolUri,
            eventsUrl: portal.apiUrl({api: 'admin:events'}),
            eventsTopic: events.MODEL_CHANGED_TOPIC,
            services: {
                visualization: portal.apiUrl({api: `${app.name}:visualization`}),
                graphQlUrl: portal.apiUrl({api: `${app.name}:graphql`}),
                i18nUrl: portal.apiUrl({api: `${app.name}:i18n`}),
            }
        }
    };
}

exports.get = handleGet;
