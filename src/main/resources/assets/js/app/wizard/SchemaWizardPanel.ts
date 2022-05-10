import * as Q from 'q';
import {Router} from '../Router';
import {UserItemWizardPanel} from './UserItemWizardPanel';
import {SecurityWizardStepForm} from './SecurityWizardStepForm';
import {SchemaWizardPanelParams} from './SchemaWizardPanelParams';
import {IdProviderWizardStepForm} from './IdProviderWizardStepForm';
import {CreateIdProviderRequest} from '../../graphql/idprovider/CreateIdProviderRequest';
import {IdProvider} from '../principal/IdProvider';
import {WizardStep} from 'lib-admin-ui/app/wizard/WizardStep';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {FormIcon} from 'lib-admin-ui/app/wizard/FormIcon';
import {i18n} from 'lib-admin-ui/util/Messages';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {SchemaWizardActions} from './SchemaWizardActions';
import {WizardHeaderWithDisplayNameAndName} from 'lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {IdProviderConfig} from 'lib-admin-ui/security/IdProviderConfig';
import {IdProviderAccessControlList} from '../access/IdProviderAccessControlList';
import {Schema, SchemaBuilder} from '../schema/Schema';
import {ResourceWizardStepForm} from './ResourceWizardStepForm';
import {UpdateSchemaRequest} from '../../graphql/apps/UpdateSchemaRequest';
import {CreateSchemaRequest} from '../../graphql/apps/CreateSchemaRequest';
import {SchemaName} from '../schema/SchemaName';
import {DeleteSchemaRequest} from '../../graphql/apps/DeleteSchemaRequest';
import {DeleteSchemaResult} from '../../graphql/apps/DeleteSchemaResult';
import {SchemaType} from '../schema/SchemaType';

export class SchemaWizardPanel
    extends UserItemWizardPanel<Schema> {

    private idProviderWizardStepForm: IdProviderWizardStepForm;

    private permissionsWizardStepForm: SecurityWizardStepForm;

    private resourceWizardStepForm: ResourceWizardStepForm;

    private defaultIdProvider: IdProvider;

    public static debug: boolean = false;

    constructor(params: SchemaWizardPanelParams) {
        super(params);

        // this.listenToUserItemEvents();
    }

    protected createWizardActions(): SchemaWizardActions {
        return new SchemaWizardActions(this);
    }

    protected getPersistedModelId(): string {
        return this.getPersistedItem() ? this.getPersistedItem().getName().toString() : null;
    }

    protected getPersistedModelName(): string {
        return this.getPersistedItem() ? this.getPersistedItem().getName().getLocalName().toString() : null;
    }


    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            if (SchemaWizardPanel.debug) {
                console.debug('SchemaWizardPanel.doRenderOnDataLoaded');
            }

            this.addClass('principal-wizard-panel id-provider-wizard-panel');
            this.getFormIcon().addClass('icon-address-book');

            return nextRendered;
        });
    }

    protected createFormIcon(): FormIcon {
        const formIcon: FormIcon = super.createFormIcon();
        formIcon.addClass('icon-address-book');
        return formIcon;
    }

    createSteps(persistedItem: Schema): WizardStep[] {
        const steps: WizardStep[] = [];

        this.resourceWizardStepForm = new ResourceWizardStepForm();
        // this.idProviderWizardStepForm = new IdProviderWizardStepForm();
        // this.permissionsWizardStepForm = new SecurityWizardStepForm();

        steps.push(new WizardStep(i18n('field.resource'), this.resourceWizardStepForm));
        // steps.push(new WizardStep(i18n('field.idProvider'), this.idProviderWizardStepForm));
        // steps.push(new WizardStep(i18n('field.permissions'), this.permissionsWizardStepForm));

        return steps;
    }

    protected getPersistedItemPath(): string {
        return `/${this.getPersistedItem().getName().toString()}`;
    }

    getUserItemType(): string {
        return i18n('field.idProvider');
    }

    doLayout(persistedSchema: Schema): Q.Promise<void> {
        return super.doLayout(persistedSchema).then(() => {

            if (this.isRendered()) {
                return Q<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedSchema ? persistedSchema.clone() : null);
            }

        });
    }

    persistNewItem(): Q.Promise<Schema> {
        this.lock();

        return new CreateSchemaRequest()
            .setSchema(this.assembleViewedSchema()).sendAndParse().then((createdSchema: Schema) => {
                showFeedback('Schema was created');
                // new UserItemUpdatedEvent(null, updatedSchema).fire();

                return createdSchema;
            }).finally(this.unlock.bind(this));

        // return this.produceCreateIdProviderRequest().sendAndParse().then((idProvider: IdProvider) => {
        //     showFeedback('Id provider was created');
        //     new UserItemCreatedEvent(null, idProvider).fire();
        //
        //     this.notifyUserItemNamed(idProvider);
        //
        //     return idProvider;
        // }).finally(this.unlock.bind(this));
    }

    postPersistNewItem(schema: Schema): Q.Promise<Schema> {
        Router.setHash('edit/' + schema.getName());

        return Q(schema);
    }

    updatePersistedItem(): Q.Promise<Schema> {
        this.lock();

        return new UpdateSchemaRequest()
            .setSchema(this.assembleViewedSchema()).sendAndParse().then((updatedSchema: Schema) => {
                showFeedback('Schema was updated');
                // new UserItemUpdatedEvent(null, updatedSchema).fire();

                return updatedSchema;
            }).finally(this.unlock.bind(this));
    }

    saveChanges(): Q.Promise<Schema> {
        if (this.isRendered()) {
            if (!this.resourceWizardStepForm.isValid()) {
                return Q.fcall(() => {
                    throw i18n('notify.invalid.idProviderConfig');
                });
            }
        }
        return super.saveChanges();
    }

    isNewChanged(): boolean {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        // const idProviderConfig: IdProviderConfig = this.idProviderWizardStepForm.getIdProviderConfig();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               (this.getPersistedItem() ? !ObjectHelper.stringEquals(this.resourceWizardStepForm.getResource(), this.getPersistedItem().getResource()) : !!this.resourceWizardStepForm.getResource()) ;
               // !ObjectHelper.stringEquals(this.idProviderWizardStepForm.getDescription(), this.defaultIdProvider.getDescription()) ||
               // !(!idProviderConfig || idProviderConfig.equals(this.defaultIdProvider.getIdProviderConfig())) ||
               // !this.permissionsWizardStepForm.getPermissions().equals(this.defaultIdProvider.getPermissions());
    }

    isPersistedEqualsViewed(): boolean {
        const viewedSchema: Schema = this.assembleViewedSchema();
        return viewedSchema.equals(this.getPersistedItem());
    }

    protected doLoadData(): Q.Promise<Schema> {
        if (SchemaWizardPanel.debug) {
            console.debug('IdProviderWizardPanel.doLoadData');
        }

        return Q(this.params.persistedItem);
        // don't call super.doLoadData to prevent saving new entity
        // return new IdProviderWizardDataLoader().loadData(this.getParams())
        //     .then((loader) => {
        //         if (SchemaWizardPanel.debug) {
        //             console.debug('IdProviderWizardPanel.doLoadData: loaded data', loader);
        //         }
        //         if (loader.idProvider) {
        //             this.formState.setIsNew(false);
        //             this.setPersistedItem(loader.idProvider);
        //             this.establishDeleteActionState(loader.idProvider.getKey());
        //         }
        //         this.defaultIdProvider = loader.defaultIdProvider;
        //         return loader.idProvider;
        //     });
    }

    protected doLayoutPersistedItem(persistedItem: Schema): Q.Promise<void> {
        if (!!persistedItem) {
            this.getWizardHeader().setDisplayName(persistedItem.getDisplayName());
            // this.getWizardHeader().setName(this.getWizardNameValue());
            this.resourceWizardStepForm.layout(persistedItem);
            // this.idProviderWizardStepForm.layout(persistedItem);
            // this.permissionsWizardStepForm.layout(persistedItem, this.defaultIdProvider);
        } else {
            this.resourceWizardStepForm.layout(null);
            // this.idProviderWizardStepForm.layout(this.defaultIdProvider);
            // this.permissionsWizardStepForm.layoutReadOnly(this.defaultIdProvider);
        }

        return Q<void>(null);
    }

    protected updateHash(): void {
        if (this.getPersistedItem()) {
            Router.setHash('edit/' + this.getPersistedItem().getName());
        } else {
            Router.setHash('new/');
        }
    }

    private assembleViewedSchema(): Schema {
        const params = (this.params as SchemaWizardPanelParams);

        return new SchemaBuilder()
            .setResource(this.resourceWizardStepForm.getResource())
            .setType(params.type)
            .setName(SchemaName.create()
                .setLocalName(this.getWizardHeader().getName())
                .setApplicationKey(params.applicationKey)
                .build())
            .setDisplayName(this.getWizardHeader().getDisplayName())
            .setModifiedTime(this.getPersistedItem() ? this.getPersistedItem().getModifiedTime() : null)
            .build();
    }

    // private listenToUserItemEvents() {
    //     const principalCreatedHandler = (event: UserItemCreatedEvent) => {
    //         if (!this.getPersistedItem()) { // skip if id provider is not persisted yet
    //             return;
    //         }
    //
    //         const principal: Principal = event.getPrincipal();
    //         const isCreatedInCurrentIdProvider: boolean = !!principal && (principal.isUser() || principal.isGroup())
    //                                            && event.getIdProvider().getKey().equals(this.getPersistedItem().getKey());
    //
    //         if (isCreatedInCurrentIdProvider) {
    //             this.wizardActions.getDeleteAction().setEnabled(false);
    //         }
    //     };
    //
    //     const principalDeletedHandler = (event: UserItemDeletedEvent) => {
    //         // skip if id provider is not persisted yet or if anything except users or roles was deleted
    //         if (!this.getPersistedItem() || !event.getPrincipals()) {
    //             return;
    //         }
    //
    //         this.getPersistedItem().isDeletable().then((result: boolean) => {
    //             this.wizardActions.getDeleteAction().setEnabled(result);
    //         });
    //     };
    //
    //     UserItemCreatedEvent.on(principalCreatedHandler);
    //     UserItemDeletedEvent.on(principalDeletedHandler);
    //
    //     this.onClosed(() => {
    //         UserItemCreatedEvent.un(principalCreatedHandler);
    //         UserItemDeletedEvent.un(principalDeletedHandler);
    //     });
    //
    // }

    private produceCreateIdProviderRequest(): CreateIdProviderRequest {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        wizardHeader.normalizeNames();
        const key: IdProviderKey = new IdProviderKey(wizardHeader.getName());
        const name: string = wizardHeader.getDisplayName();
        const description: string = this.idProviderWizardStepForm.getDescription();
        const idProviderConfig: IdProviderConfig = this.idProviderWizardStepForm.getIdProviderConfig();
        const permissions: IdProviderAccessControlList = this.permissionsWizardStepForm.getPermissions();

        return new CreateIdProviderRequest()
            .setDisplayName(name)
            .setKey(key)
            .setDescription(description)
            .setIdProviderConfig(idProviderConfig)
            .setPermissions(permissions);
    }

    private establishDeleteActionState(key: IdProviderKey) {
        if (key) {
            IdProvider.checkOnDeletable(key).then((result: boolean) => {
                this.wizardActions.getDeleteAction().setEnabled(result);
            }).catch(DefaultErrorHandler.handle).done();
        }
    }


    // protected handleServerUpdate(principal: Principal, idProvider: IdProvider): void {
    //     if (idProvider && this.getPersistedItem().getKey().equals(idProvider.getKey())) {
    //         this.setPersistedItem(idProvider);
    //         this.doLayoutPersistedItem(idProvider);
    //     }
    // }

    protected handleSuccessfulDelete(result: DeleteSchemaResult<any>): void {
        if (result.getResult()) {
            showFeedback(
                i18n('notify.delete.schema.single', result.getId().toString()));
        }

        this.close();
        // UserItemDeletedEvent.create().setIdProviders([this.getPersistedItem()]).build().fire();
    }

    protected produceDeleteRequest(): DeleteSchemaRequest {
        return new DeleteSchemaRequest().setIds([this.getPersistedItem().getName()]).setType(
            SchemaType[this.getPersistedItem().getType().toString()]) as DeleteSchemaRequest;
    }

}
