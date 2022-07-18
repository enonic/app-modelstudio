import * as Q from 'q';
import {ModelWizardActions} from './action/ModelWizardActions';
import {DynamicWizardPanelParams} from './DynamicWizardPanelParams';
import {ResponsiveManager} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveManager';
import {ResponsiveItem} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveItem';
import {FormIcon} from '@enonic/lib-admin-ui/app/wizard/FormIcon';
import {WizardHeaderWithDisplayNameAndName} from '@enonic/lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {WizardStep} from '@enonic/lib-admin-ui/app/wizard/WizardStep';
import {Toolbar} from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';
import {WizardPanel} from '@enonic/lib-admin-ui/app/wizard/WizardPanel';
import {ImgEl} from '@enonic/lib-admin-ui/dom/ImgEl';
import {ElementShownEvent} from '@enonic/lib-admin-ui/dom/ElementShownEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {GraphQlRequest} from '../../graphql/GraphQlRequest';


export abstract class ModelWizardPanel<USER_ITEM_TYPE extends Equitable>
    extends WizardPanel<USER_ITEM_TYPE> {

    protected wizardActions: ModelWizardActions<USER_ITEM_TYPE>;

    protected params: DynamicWizardPanelParams<USER_ITEM_TYPE>;

    private locked: boolean;

    private lockChangedListeners: { (value: boolean): void }[];

    protected constructor(params: DynamicWizardPanelParams<USER_ITEM_TYPE>) {
        super(params);

        this.lockChangedListeners = [];

        this.initListeners();
    }

    protected initListeners() {
        this.onWizardHeaderCreated(() => {
            this.getWizardHeader().setAutoTrim(true);
        });

        this.loadData();

        this.onValidityChanged(() => {
            this.updateSaveButtonState();
        });

        this.onShown(() => {
            if (this.locked) {
                this.lock();
            }
        });

        this.wizardActions.getDeleteAction().onExecuted(this.handleDelete.bind(this));

        this.handleServerEvents();
    }

    protected updateSaveButtonState(): void {
        this.wizardActions.getSaveAction().setEnabled(this.isValid() && this.hasUnsavedChanges());
    }

    protected getParams(): DynamicWizardPanelParams<USER_ITEM_TYPE> {
        return this.params;
    }

    protected createWizardActions(): ModelWizardActions<USER_ITEM_TYPE> {
        return new ModelWizardActions(this);
    }

    protected createMainToolbar(): Toolbar {
        const toolbar: Toolbar = new Toolbar();

        toolbar.addAction(this.wizardActions.getSaveAction());
        toolbar.addAction(this.wizardActions.getDeleteAction());

        return toolbar;
    }

    protected getWizardNameValue(): string {
        return this.getPersistedItem() ? this.getPersistedName() : '';
    }

    protected getPersistedModelId(): string {
        throw Error('Must be implemented in inheritors');
    }

    protected getPersistedName(): string {
        throw Error('Must be implemented in inheritors');
    }


    protected createWizardHeader(): WizardHeaderWithDisplayNameAndName {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = new WizardHeaderWithDisplayNameAndName();
        const existing: USER_ITEM_TYPE = this.getPersistedItem();
        const name: string = this.getWizardNameValue();

        let displayName: string = '';

        if (existing) {
            displayName = this.getPersistedDisplayName();

            wizardHeader.toggleNameInput(false);
            wizardHeader.setAutoGenerationEnabled(false);
        }

        wizardHeader.setDisplayName(displayName);

        wizardHeader.setPath(this.getParams().persistedPath);
        wizardHeader.setName(name);

        return wizardHeader;
    }

    public getWizardHeader(): WizardHeaderWithDisplayNameAndName {
        return <WizardHeaderWithDisplayNameAndName> super.getWizardHeader();
    }

    protected createFormIcon(): FormIcon {
        let iconUrl = ImgEl.PLACEHOLDER;
        let formIcon = new FormIcon(iconUrl, 'icon');
        formIcon.addClass('icon icon-xlarge');

        return formIcon;
    }

    public getFormIcon(): FormIcon {
        return <FormIcon> super.getFormIcon();
    }

    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            this.addClass('principal-wizard-panel');

            const responsiveItem = ResponsiveManager.onAvailableSizeChanged(this, (item: ResponsiveItem) => {
                if (this.isVisible()) {
                    this.updateStickyToolbar();
                }
            });

            this.updateHash();
            this.onRemoved((event) => ResponsiveManager.unAvailableSizeChanged(this));

            this.onShown((event: ElementShownEvent) => {
                this.updateHash();
                responsiveItem.update();
            });

            return nextRendered;
        });
    }

    private handleServerEvents() {
        const deleteHandler = (ids: string[]) => {
            const id: string = this.isDataLoaded() ? this.getPersistedModelId() : this.params.tabId.getId();

            if (!!id && ids.indexOf(id) >= 0) {
                this.close();
            }
        };

    }

    protected getPersistedItemPath(): string {
        throw new Error('To be implemented by inheritors');
    }

    protected setPersistedItem(newPersistedItem: USER_ITEM_TYPE): void {
        super.setPersistedItem(newPersistedItem);

        if (this.wizardHeader) {
            (<WizardHeaderWithDisplayNameAndName>this.wizardHeader).toggleNameInput(false);
        }
    }

    getType(): string {
        throw new Error('Must be implemented by inheritors');
    }

    getPersistedDisplayName(): string {
        return this.getParams().persistedDisplayName ? this.getParams().persistedDisplayName : '';
    }

    lock(): void {
        this.locked = true;
        this.formMask.show();
        this.notifyLockChanged(this.locked);
    }

    unlock(): void {
        this.locked = false;

        this.formMask.hide();
        this.notifyLockChanged(this.locked);
    }

    saveChanges(): Q.Promise<USER_ITEM_TYPE> {
        if (this.isRendered()) {
            this.getWizardHeader().normalizeNames();
            if (!this.getWizardHeader().getName()) {
                return Q.fcall(() => {
                    throw i18n('notify.empty.name');
                });
            }
            if (!this.getWizardHeader().getDisplayName()) {
                return Q.fcall(() => {
                    throw i18n('notify.empty.displayName');
                });
            }
        }
        return super.saveChanges();
    }

    close(checkCanClose: boolean = false): void {
        if (!checkCanClose || this.canClose()) {
            super.close(checkCanClose);
        }
    }

    canClose(): boolean {
        if (this.hasUnsavedChanges()) {
            this.openSaveBeforeCloseDialog();
            return false;
        } else {
            return true;
        }
    }

    private openSaveBeforeCloseDialog() {
        new ConfirmationDialog()
            .setQuestion(i18n('dialog.confirm.unsavedChanges'))
            .setYesCallback(this.saveAndClose.bind(this))
            .setNoCallback(this.close.bind(this))
            .open();
    }

    private saveAndClose() {
        this.saveChanges().then(() => {
            this.close();
        }).catch(DefaultErrorHandler.handle);
    }

    hasUnsavedChanges(): boolean {
        if (!this.isRendered()) {
            return false;
        }
        const persisted = this.getPersistedItem();
        if (persisted) {
            return !this.isPersistedEqualsViewed();
        }
        return this.isNewChanged();
    }

    createSteps(persistedItem: USER_ITEM_TYPE): WizardStep[] {
        throw new Error('Must be implemented by inheritors');
    }

    doLayout(persistedItem: USER_ITEM_TYPE): Q.Promise<void> {
        this.setSteps(this.createSteps(this.getPersistedItem()));

        return Q<void>(null);
    }

    protected doLayoutPersistedItem(persistedItem: USER_ITEM_TYPE): Q.Promise<void> {
        throw new Error('Must be implemented by inheritors');
    }

    persistNewItem(): Q.Promise<USER_ITEM_TYPE> {
        throw new Error('Must be implemented by inheritors');
    }

    updatePersistedItem(): Q.Promise<USER_ITEM_TYPE> {
        throw new Error('Must be implemented by inheritors');
    }

    getCloseAction(): Action {
        return this.wizardActions.getCloseAction();
    }

    protected updateHash(): void {
        throw new Error('Must be implemented by inheritors');
    }

    isPersistedEqualsViewed(): boolean {
        throw new Error('Must be implemented by inheritors');
    }

    isNewChanged(): boolean {
        throw new Error('Must be implemented by inheritors');
    }

    protected handleDelete(): void {
        new ConfirmationDialog()
            .setQuestion(i18n('dialog.delete.question'))
            .setNoCallback(null)
            .setYesCallback(() => {
                if (!this.isItemPersisted()) {
                    return;
                }

                this.produceDeleteRequest()
                    .sendAndParse()
                    .done((result) => {
                        this.handleDeletedResult(result);
                    });

            }).open();
    }

    protected abstract produceDeleteRequest(): GraphQlRequest<any>;

    protected handleDeletedResult(result): void {
            this.handleSuccessfulDelete(result);
    }

    protected abstract handleSuccessfulDelete(result);

    onLockChanged(listener: (value: boolean) => void): void {
        this.lockChangedListeners.push(listener);
    }

    unLockChanged(listener: (value: boolean) => void): void {
        this.lockChangedListeners = this.lockChangedListeners.filter((curr: (value: boolean) => void) => {
            return listener !== curr;
        });
    }

    private notifyLockChanged(value: boolean) {
        this.lockChangedListeners.forEach((listener: (value: boolean) => void) => {
            listener(value);
        });
    }
}
