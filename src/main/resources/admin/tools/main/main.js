const mustache = require('/lib/mustache');
const portal = require('/lib/xp/portal');
const admin = require('/lib/xp/admin');
const i18n = require('/lib/xp/i18n');
const assetLib = require('/lib/enonic/asset');

function handleGet(req) {
    const view = resolve('./main.html');

    const params = {
        assetsUri: assetLib.assetUrl({path: ''}),
        appName: i18n.localize({
            key: 'admin.tool.displayName',
            bundles: ['i18n/phrases'],
            locale: req.locales
        }),
        configServiceUrl: portal.apiUrl({api: `${app.name}:config`}),
        menuLoaderUrl: admin.extensionUrl({
            application: 'com.enonic.xp.app.main',
            extension: 'menu-loader',
            params: {
                appName: app.name,
                theme: 'dark'
            }
        })
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params),
        headers: {
            'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\'; object-src \'none\'; img-src \'self\' data:'
        }
    };
}

exports.get = handleGet;
