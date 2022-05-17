import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './browse/UserTreeGridItem';
import {ModelWizardPanel} from './wizard/ModelWizardPanel';
import {SchemaWizardPanel} from './wizard/SchemaWizardPanel';
import {NewModelEvent} from './browse/NewModelEvent';
import {EditPrincipalEvent} from './browse/EditPrincipalEvent';
import {UserBrowsePanel} from './browse/UserBrowsePanel';
import {SchemaWizardPanelParams} from './wizard/SchemaWizardPanelParams';
import {ComponentWizardPanelParams} from './wizard/ComponentWizardPanelParams';
import {GetIdProviderByKeyRequest} from '../graphql/idprovider/GetIdProviderByKeyRequest';
import {GetPrincipalByKeyRequest} from '../graphql/principal/GetPrincipalByKeyRequest';
import {UserItemNamedEvent} from './event/UserItemNamedEvent';
import {IdProvider} from './principal/IdProvider';
import {NavigatedAppPanel} from 'lib-admin-ui/app/NavigatedAppPanel';
import {AppBarTabMenuItem, AppBarTabMenuItemBuilder} from 'lib-admin-ui/app/bar/AppBarTabMenuItem';
import {AppBarTabId} from 'lib-admin-ui/app/bar/AppBarTabId';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {LoadMask} from 'lib-admin-ui/ui/mask/LoadMask';
import {TabbedAppBar} from 'lib-admin-ui/app/bar/TabbedAppBar';
import {Path} from 'lib-admin-ui/rest/Path';
import {ShowBrowsePanelEvent} from 'lib-admin-ui/app/ShowBrowsePanelEvent';
import {PropertyChangedEvent} from 'lib-admin-ui/PropertyChangedEvent';
import {ValidityChangedEvent} from 'lib-admin-ui/ValidityChangedEvent';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {showError} from 'lib-admin-ui/notify/MessageBus';
import {NamePrettyfier} from 'lib-admin-ui/NamePrettyfier';
import {IdProviderMode} from 'lib-admin-ui/security/IdProviderMode';
import {Exception} from 'lib-admin-ui/Exception';
import {Schema} from './schema/Schema';
import {SchemaType} from './schema/SchemaType';
import {ModelWizardData} from './ModelWizardData';
import {SchemaWizardData} from './SchemaWizardData';
import {ComponentWizardData} from './ComponentWizardData';
import {ComponentWizardPanel} from './wizard/ComponentWizardPanel';
import {ComponentType} from './schema/ComponentType';
import {ModelName} from './schema/ModelName';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {Component} from './schema/Component';
import {NewApplicationEvent} from './browse/NewApplicationEvent';
import {ApplicationWizardPanelParams} from './wizard/ApplicationWizardPanelParams';
import {ApplicationWizardPanel} from './wizard/ApplicationWizardPanel';
import {Application} from './application/Application';
import {RenderableApplication} from './application/RenderableApplication';


interface PrincipalData {

    tabName: string;

    principalPath: string;

    principalType: PrincipalType;
}

export class UserAppPanel
    extends NavigatedAppPanel {

    private mask: LoadMask;

    constructor(appBar: TabbedAppBar, path?: Path) {

        super(appBar);

        this.mask = new LoadMask(this);

        this.route(path);
    }

    private route(path?: Path) {
        const action = path ? path.getElement(0) : null;
        let id;

        switch (action) {
        case 'edit':
            id = path.getElement(1);
            if (id && this.isValidPrincipalKey(id)) {
                new GetPrincipalByKeyRequest(PrincipalKey.fromString(id)).sendAndParse().done(
                    (principal: Principal) => {
                        new EditPrincipalEvent([
                            new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build()
                        ]).fire();
                    });
            } else if (id && this.isValidIdProviderKey(id)) {
                new GetIdProviderByKeyRequest(IdProviderKey.fromString(id)).sendAndParse().done((idProvider: IdProvider) => {
                    new EditPrincipalEvent([
                        new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(
                            UserTreeGridItemType.ID_PROVIDER).build()
                    ]).fire();
                });
            } else {
                new ShowBrowsePanelEvent().fire();
            }
            break;
        case 'view':
            id = path.getElement(1);
            break;
        default:
            new ShowBrowsePanelEvent().fire();
            break;
        }
    }

    private isValidPrincipalKey(value: string): boolean {
        try {
            PrincipalKey.fromString(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    private isValidIdProviderKey(value: string): boolean {
        try {
            IdProviderKey.fromString(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    addWizardPanel(tabMenuItem: AppBarTabMenuItem, wizardPanel: ModelWizardPanel<any>): void {
        super.addWizardPanel(tabMenuItem, wizardPanel);

        wizardPanel.onRendered(() => {
            tabMenuItem.setLabel(this.getWizardPanelItemDisplayName(wizardPanel));

            wizardPanel.getWizardHeader().onPropertyChanged((event: PropertyChangedEvent) => {
                if (event.getPropertyName() === 'displayName') {
                    let name = <string>event.getNewValue() || this.getPrettyNameForWizardPanel(wizardPanel);
                    tabMenuItem.setLabel(name, !<string>event.getNewValue());
                }
            });
        });

        //tabMenuItem.markInvalid(!wizardPanel.getPersistedItem().isValid());

        wizardPanel.onValidityChanged((event: ValidityChangedEvent) => {
            tabMenuItem.markInvalid(!wizardPanel.isValid());
        });

        wizardPanel.onLockChanged(value => {
            value ? tabMenuItem.lock() : tabMenuItem.unlock();
        });
    }

    protected handleGlobalEvents(): void {
        super.handleGlobalEvents();

        NewModelEvent.on((event) => {
            this.handleNewModel(event);
        });

        NewApplicationEvent.on(() => {
            this.handleNewApplication();
        });

        EditPrincipalEvent.on((event) => {
            this.handleEditModel(event);
        });
    }

    handleBrowse(): void {
        super.handleBrowse();

        this.getAppBarTabMenu().deselectNavigationItem();
    }

    protected createBrowsePanel(): UserBrowsePanel {
        return new UserBrowsePanel();
    }

    private handleWizardCreated(wizard: ModelWizardPanel<any>, tabName: string) {
        wizard.onUserItemNamed((event: UserItemNamedEvent) => {
            this.handleUserItemNamedEvent(event);
        });

        const tabMenuItem = new AppBarTabMenuItemBuilder()
            .setLabel(NamePrettyfier.prettifyUnnamed(tabName))
            .setTabId(wizard.getTabId())
            .setCloseAction(wizard.getCloseAction())
            .build();

        this.addWizardPanel(tabMenuItem, wizard);

    }

    private getWizardPanelItemDisplayName(wizardPanel: ModelWizardPanel<any>): string {
        if (wizardPanel.getPersistedItem()) {
            return wizardPanel.getPersistedItem().getDisplayName();
        }

        return this.getPrettyNameForWizardPanel(wizardPanel);
    }

    private getPrettyNameForWizardPanel(wizard: ModelWizardPanel<UserItem>): string {
        return NamePrettyfier.prettifyUnnamed((wizard).getType());
    }

    private handleWizardUpdated(wizard: ModelWizardPanel<any>, tabMenuItem: AppBarTabMenuItem) {

        if (tabMenuItem != null) {
            this.getAppBarTabMenu().deselectNavigationItem();
            this.getAppBarTabMenu().removeNavigationItem(tabMenuItem);
            this.removePanelByIndex(tabMenuItem.getIndex());
        }
        tabMenuItem =
            new AppBarTabMenuItemBuilder().setTabId(wizard.getTabId()).setEditing(true).setCloseAction(wizard.getCloseAction()).setLabel(
                wizard.getPersistedDisplayName()).build();
        this.addWizardPanel(tabMenuItem, wizard);

        // TODO: what is this view that we try to remove?
        /*var viewTabId = AppBarTabId.forView(id);
         var viewTabMenuItem = this.getAppBarTabMenu().getNavigationItemById(viewTabId);
         if (viewTabMenuItem != null) {
         this.removePanelByIndex(viewTabMenuItem.getIndex());
         }*/
    }

    private handleNewApplication() {
        let tabId = AppBarTabId.forNew('new-application');
        let tabMenuItem = this.getAppBarTabMenu().getNavigationItemById(tabId);

        let tabName = i18n('field.application');

        if (tabMenuItem != null) {
            this.selectPanel(tabMenuItem);
        } else {

            this.createWizardForNewApplication(tabId, tabName);
        }
    }

    private handleNewModel(event: NewModelEvent) {
        let modelItem = event.getPrincipals()[0];
        const application = modelItem.getApplication();

        let tabId = AppBarTabId.forNew(application.getApplicationKey().toString());
        let tabMenuItem = this.getAppBarTabMenu().getNavigationItemById(tabId);

        let tabName = i18n('field.xdata');

        if (tabMenuItem != null) {
            this.selectPanel(tabMenuItem);
        } else {

            let data: ModelWizardData<any>;
            const key: ApplicationKey = modelItem.getApplication().getApplicationKey();

            if (modelItem.isContentType() || modelItem.isContentTypes()) {
                data = new SchemaWizardData(SchemaType.CONTENT_TYPE, key);
            } else if (modelItem.isMixin() || modelItem.isMixins()) {
                data = new SchemaWizardData(SchemaType.MIXIN, key);
            } else if (modelItem.isXData() || modelItem.isXDatas()) {
                data = new SchemaWizardData(SchemaType.XDATA, key);
            }

            if (modelItem.isPart() || modelItem.isParts()) {
                data = new ComponentWizardData(ComponentType.PART, key);
            } else if (modelItem.isLayout() || modelItem.isLayouts()) {
                data = new ComponentWizardData(ComponentType.LAYOUT, key);
            } else if (modelItem.isPage() || modelItem.isPages()) {
                data = new ComponentWizardData(ComponentType.PAGE, key);
            }

            this.createWizardForNewModel(tabId, tabName, data);
        }

    }

    private resolvePrincipalData(userItem: UserTreeGridItem): PrincipalData {
        let principalType: PrincipalType;
        let principalPath = '';
        let tabName;

        if (userItem) {
            switch (userItem.getType()) {

            case UserTreeGridItemType.USERS:
                principalType = PrincipalType.USER;
                principalPath = PrincipalKey.ofUser(userItem.getIdProvider().getKey(), 'none').toPath(true);
                tabName = i18n('field.user');
                break;
            case UserTreeGridItemType.GROUPS:
                principalType = PrincipalType.GROUP;
                principalPath = PrincipalKey.ofGroup(userItem.getIdProvider().getKey(), 'none').toPath(true);
                tabName = i18n('field.group');
                break;
            case UserTreeGridItemType.ROLES:
                principalType = PrincipalType.ROLE;
                principalPath = PrincipalKey.ofRole('none').toPath(true);
                tabName = i18n('field.role');
                break;
            case UserTreeGridItemType.PRINCIPAL:
                principalType = userItem.getPrincipal().getType();
                principalPath = userItem.getPrincipal().getKey().toPath(true);
                tabName = i18n(`field.${PrincipalType[principalType].toLowerCase()}`);
                break;
            case UserTreeGridItemType.ID_PROVIDER:
                tabName = i18n('field.idProvider');
                break;
            }

        } else {
            tabName = i18n('field.idProvider');
        }

        return {
            tabName,
            principalType,
            principalPath
        };
    }

    private loadIdProviderIfNeeded(userItem: UserTreeGridItem) {
        let promise;
        this.mask.show();

        switch (userItem.getType()) {
        case UserTreeGridItemType.USERS:
        case UserTreeGridItemType.GROUPS:
            promise = new GetIdProviderByKeyRequest(userItem.getIdProvider().getKey()).sendAndParse();
            break;
        case UserTreeGridItemType.PRINCIPAL:
            // Roles does not have a IdProvider link
            if (userItem.getPrincipal().getType() !== PrincipalType.ROLE) {
                promise = new GetIdProviderByKeyRequest(userItem.getPrincipal().getKey().getIdProvider()).sendAndParse();
            } else {
                promise = Q(userItem.getIdProvider());
            }
            break;
        default:
        case UserTreeGridItemType.ID_PROVIDER:
        case UserTreeGridItemType.ROLES:
            promise = Q(userItem.getIdProvider());
            break;
        }

        return promise
            .catch((reason: Error | Exception) => {
                DefaultErrorHandler.handle(reason);
            }).finally(() => {
                this.mask.hide();
            });
    }

    // private handleSchemaNew(tabId: AppBarTabId) {
    //     let wizardParams: SchemaWizardPanelParams = <SchemaWizardPanelParams> new SchemaWizardPanelParams()
    //         // .setPersistedItem(schema)
    //         .setTabId(tabId)
    //         // .setPersistedDisplayName(schema.getDisplayName());
    //
    //     let wizard = new SchemaWizardPanel(wizardParams);
    //
    //     //
    //     // this.handleWizardCreated(wizard, data.tabName);
    // }

    private handlePrincipalNew(tabId: AppBarTabId, data: PrincipalData, idProvider: IdProvider, userItem: UserTreeGridItem) {
        if (data.principalType === PrincipalType.USER && !this.areUsersEditable(idProvider)) {
            showError(i18n('notify.invalid.application', i18n('action.create').toLowerCase(),
                i18n('field.users').toLowerCase()));
            return;
        }
        if (data.principalType === PrincipalType.GROUP && !this.areGroupsEditable(idProvider)) {
            showError(i18n('notify.invalid.application', i18n('action.create').toLowerCase(),
                i18n('field.groups').toLowerCase()));
            return;
        }

        //TODO: new
        // let wizardParams = <ComponentWizardPanelParams> new ComponentWizardPanelParams()
        //     .setIdProvider(idProvider)
        //     .setParentOfSameType(userItem.getType() === UserTreeGridItemType.PRINCIPAL)
        //     .setPersistedType(data.principalType)
        //     .setPersistedPath(data.principalPath)
        //     .setTabId(tabId);

        // const wizard = this.resolvePrincipalWizardPanel(wizardParams);
        //
        // this.handleWizardCreated(wizard, data.tabName);
    }

    private createWizardForNewApplication(tabId: AppBarTabId, tabName: string) {
        const wizardParams = new ApplicationWizardPanelParams()
            // .setApplicationKey(modelData.getApplicationKey())
            // .setPersistedPath(modelData.getApplicationKey().toString())
            .setTabId(tabId);

        this.handleWizardCreated(new ApplicationWizardPanel(wizardParams), tabName);
    }

    private createWizardForNewModel(tabId: AppBarTabId, tabName: string, modelData: ModelWizardData<any>) {
        let wizardParams;

        if(modelData instanceof SchemaWizardData) {
            wizardParams = new SchemaWizardPanelParams()
                .setType(<SchemaType>modelData.getType())
                .setApplicationKey(modelData.getApplicationKey())
                .setPersistedPath(modelData.getApplicationKey().toString())
                .setTabId(tabId);

            this.handleWizardCreated(new SchemaWizardPanel(wizardParams), tabName);
        }

        if(modelData instanceof ComponentWizardData) {
            wizardParams = new ComponentWizardPanelParams()
                .setType(<ComponentType>modelData.getType())
                .setApplicationKey(modelData.getApplicationKey())
                .setPersistedPath(modelData.getApplicationKey().toString())
                .setTabId(tabId);

            this.handleWizardCreated(new ComponentWizardPanel(wizardParams), tabName);
        }
    }

    private handleEditModel(event: EditPrincipalEvent) {
        let userItems: UserTreeGridItem[] = event.getPrincipals();

        userItems.forEach((userItem: UserTreeGridItem) => {
            if (!userItem) {
                return;
            }

            let tabMenuItem = this.resolveTabMenuItem(userItem);

            if (tabMenuItem != null) {
                this.selectPanel(tabMenuItem);
            } else {
                let tabId = this.getTabIdForUserItem(userItem);
                if (userItem.isComponent()) {
                    this.handleComponentEdit(userItem.getComponent(), tabId, tabMenuItem);
                } else if (userItem.isSchema()) {
                    this.handleSchemaEdit(userItem.getSchema(), tabId, tabMenuItem);
                } else if (userItem.isApplication()) {
                    this.handleApplicationEdit(userItem.getApplication(), tabId, tabMenuItem);
                }
            }
        });
    }

    private handleApplicationEdit(application: RenderableApplication, tabId: AppBarTabId, tabMenuItem: AppBarTabMenuItem) {

        const wizardParams: ApplicationWizardPanelParams = new ApplicationWizardPanelParams()
            .setApplicationKey(application.getApplicationKey())
            .setPersistedItem(application.getApplication())
            .setTabId(tabId)
            .setPersistedPath(application.getApplicationKey().toString())
            .setPersistedDisplayName(application.getDisplayName()) as ApplicationWizardPanelParams;

        let wizard = new ApplicationWizardPanel(wizardParams);

        this.handleWizardUpdated(wizard, tabMenuItem);
    }

    private handleSchemaEdit(schema: Schema, tabId: AppBarTabId, tabMenuItem: AppBarTabMenuItem) {

        const wizardParams: SchemaWizardPanelParams = new SchemaWizardPanelParams()
            .setType(schema.getType())
            .setApplicationKey(schema.getName().getApplicationKey())
            .setPersistedItem(schema)
            .setTabId(tabId)
            .setPersistedPath(schema.getName().getApplicationKey().toString())
            .setPersistedDisplayName(schema.getDisplayName()) as SchemaWizardPanelParams;

        let wizard = new SchemaWizardPanel(wizardParams);

        this.handleWizardUpdated(wizard, tabMenuItem);
    }

    private handleComponentEdit(component: Component, tabId: AppBarTabId, tabMenuItem: AppBarTabMenuItem) {

        const wizardParams: ComponentWizardPanelParams = new ComponentWizardPanelParams()
            .setType(component.getType())
            .setApplicationKey(component.getName().getApplicationKey())
            .setPersistedItem(component)
            .setTabId(tabId)
            .setPersistedPath(component.getName().getApplicationKey().toString())
            .setPersistedDisplayName(component.getDisplayName()) as ComponentWizardPanelParams;

        let wizard = new ComponentWizardPanel(wizardParams);

        this.handleWizardUpdated(wizard, tabMenuItem);
    }

    // private handleComponentEdit(component: Component, tabId: AppBarTabId, tabMenuItem: AppBarTabMenuItem) {
    //
    //     let wizardParams = new ComponentWizardPanelParams()
    //         .setComponent(component)
    //         .setTabId(tabId)
    //         // .setPersistedPath(modelData.applicationKey.toString())
    //         .setPersistedDisplayName(component.getDisplayName());
    //
    //     // TODO: component wizard panel
    //     // let wizard = new ComponentWizardPanel(wizardParams);
    //
    //     // this.handleWizardUpdated(wizard, tabMenuItem);
    // }

    // private handlePrincipalEdit(principal: Principal, idProvider: IdProvider, tabId: AppBarTabId, tabMenuItem: AppBarTabMenuItem) {
    //
    //     let principalType = principal.getType();
    //
    //     if (PrincipalType.USER === principalType && !this.areUsersEditable(idProvider)) {
    //         showError(i18n('notify.invalid.application', i18n('action.edit').toLowerCase(), i18n('field.users').toLowerCase()));
    //         return;
    //
    //     } else if (PrincipalType.GROUP === principalType && !this.areGroupsEditable(idProvider)) {
    //         showError(i18n('notify.invalid.application', i18n('action.edit').toLowerCase(), i18n('field.groups').toLowerCase()));
    //         return;
    //
    //     } else {
    //         this.createPrincipalWizardPanelForEdit(principal, idProvider, tabId, tabMenuItem);
    //
    //     }
    // }

    // private createComponentWizardPanelForEdit(component: Component, tabId: AppBarTabId,
    //                                           tabMenuItem: AppBarTabMenuItem) {
    //
    //     const wizardParams: ComponentWizardPanelParams = <ComponentWizardPanelParams>new ComponentWizardPanelParams()
    //         .setComponent(component)
    //         .setTabId(tabId)
    //         .setPersistedDisplayName(component.getDisplayName());
    //
    //     // let wizard = this.resolveComponentWizardPanel(wizardParams);
    //     //
    //     // this.handleWizardUpdated(wizard, tabMenuItem);
    // }

    // private resolveComponentWizardPanel(wizardParams: ComponentWizardPanelParams): UserItemWizardPanel<Component> {
    //     let wizard: PrincipalWizardPanel;
    //     switch (wizardParams.persistedType) {
    //     case PrincipalType.ROLE:
    //         wizard = new RoleWizardPanel(wizardParams);
    //         break;
    //     case PrincipalType.USER:
    //         wizard = new UserWizardPanel(wizardParams);
    //         break;
    //     case PrincipalType.GROUP:
    //         wizard = new GroupWizardPanel(wizardParams);
    //         break;
    //     default:
    //         wizard = new PrincipalWizardPanel(wizardParams);
    //     }
    //     return wizard;
    // }

    private handleUserItemNamedEvent(event: UserItemNamedEvent) {
        const wizard = event.getWizard();
        const userItem = event.getUserItem();
        const tabMenuItem = this.getAppBarTabMenu().getNavigationItemById(wizard.getTabId());
        // update tab id so that new wizard for the same content type can be created
        const newTabId = AppBarTabId.forEdit(userItem.getKey().toString());
        tabMenuItem.setTabId(newTabId);
        wizard.setTabId(newTabId);

        const name = userItem.getDisplayName() || this.getPrettyNameForWizardPanel(wizard);
        this.getAppBarTabMenu().getNavigationItemById(newTabId).setLabel(name, !userItem.getDisplayName());
    }

    private resolveTabMenuItem(userItem: UserTreeGridItem): AppBarTabMenuItem {
        if (!!userItem) {
            return this.getAppBarTabMenu().getNavigationItemById(this.getTabIdForUserItem(userItem));
        }
        return null;
    }

    private getTabIdForUserItem(userItem: UserTreeGridItem): AppBarTabId {
        let appBarTabId: AppBarTabId;
        //TODO: check on unique: works for components and schemas
        if (userItem.isComponent()) {
            appBarTabId = AppBarTabId.forEdit(userItem.getComponent().getName().toString());
        } else if (userItem.isSchema()) {
            appBarTabId = AppBarTabId.forEdit(userItem.getSchema().getName().toString());
        } else if (userItem.isApplication()) {
            appBarTabId = AppBarTabId.forEdit(userItem.getApplication().getApplicationKey().toString());
        }

        // if (UserTreeGridItemType.PRINCIPAL === userItem.getType()) {
        //     appBarTabId = AppBarTabId.forEdit(userItem.getPrincipal().getKey().toString());
        // } else if (UserTreeGridItemType.ID_PROVIDER === userItem.getType()) {
        //     appBarTabId = AppBarTabId.forEdit(userItem.getIdProvider().getKey().toString());
        // }
        return appBarTabId;
    }

    private areUsersEditable(idProvider: IdProvider): boolean {
        let idProviderMode = idProvider.getIdProviderMode();
        return IdProviderMode.EXTERNAL !== idProviderMode && IdProviderMode.MIXED !== idProviderMode;
    }

    private areGroupsEditable(idProvider: IdProvider): boolean {
        let idProviderMode = idProvider.getIdProviderMode();
        return IdProviderMode.EXTERNAL !== idProviderMode;
    }

}
