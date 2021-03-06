import {ModelAppPanel} from './app/ModelAppPanel';
import {Router} from './app/Router';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {Application} from '@enonic/lib-admin-ui/app/Application';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ConnectionDetector} from '@enonic/lib-admin-ui/system/ConnectionDetector';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {TabbedAppBar} from '@enonic/lib-admin-ui/app/bar/TabbedAppBar';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {i18nInit} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {ModelStudioServerEventsListener} from './app/event/ModelStudioServerEventsListener';

const body = Body.get();

function getApplication(): Application {
    const assetsUri: string = CONFIG.getString('assetsUri');
    const application = new Application(
        CONFIG.getString('appId'),
        i18n('admin.tool.displayName'),
        i18n('app.abbr'),
        `${assetsUri}/icons/icon-white.svg`
    );
    application.setPath(Path.fromString(Router.getPath()));
    application.setWindow(window);

    return application;
}

function startLostConnectionDetector() {
    ConnectionDetector.get()
        .setAuthenticated(true)
        .setSessionExpireRedirectUrl(CONFIG.getString('toolUri'))
        .setNotificationMessage(i18n('notify.connection.loss'))
        .startPolling(true);
}

function startApplication() {

    const application: Application = getApplication();
    const appBar = new TabbedAppBar(application);
    appBar.setHomeIconAction();

    const appPanel = new ModelAppPanel(appBar, application.getPath());

    body.appendChild(appBar);
    body.appendChild(appPanel);

    AppHelper.preventDragRedirect();

    application.setLoaded(true);

    startLostConnectionDetector();
    new ModelStudioServerEventsListener([application]).start();
}

(async () => {
    if (!document.currentScript) {
        throw 'Legacy browsers are not supported';
    }
    const configServiceUrl = document.currentScript.getAttribute('data-config-service-url');
    if (!configServiceUrl) {
        throw 'Unable to fetch app config';
    }
    await CONFIG.init(configServiceUrl);
    await i18nInit(CONFIG.getString('services.i18nUrl'));
    startApplication();
})();
