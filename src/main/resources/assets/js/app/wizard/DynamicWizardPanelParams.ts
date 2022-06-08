import {AppBarTabId} from '@enonic/lib-admin-ui/app/bar/AppBarTabId';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';


export class DynamicWizardPanelParams<USER_ITEM_TYPE> {

    tabId: AppBarTabId;

    applicationKey: ApplicationKey;

    persistedPath: string;

    persistedDisplayName: string;

    persistedItem: USER_ITEM_TYPE;

    setPersistedPath(value: string): DynamicWizardPanelParams<USER_ITEM_TYPE> {
        this.persistedPath = value;
        return this;
    }

    setPersistedItem(value: USER_ITEM_TYPE): DynamicWizardPanelParams<USER_ITEM_TYPE> {
        this.persistedItem = value;
        return this;
    }

    setTabId(value: AppBarTabId): DynamicWizardPanelParams<USER_ITEM_TYPE> {
        this.tabId = value;
        return this;
    }

    setApplicationKey(value: ApplicationKey): DynamicWizardPanelParams<USER_ITEM_TYPE> {
        this.applicationKey = value;
        return this;
    }

    setPersistedDisplayName(value: string): DynamicWizardPanelParams<USER_ITEM_TYPE> {
        this.persistedDisplayName = value;
        return this;
    }

}
