import * as Q from 'q';
import {Router} from '../Router';
import {ModelWizardPanel} from './ModelWizardPanel';
import {SchemaWizardPanelParams} from './SchemaWizardPanelParams';
import {WizardStep} from 'lib-admin-ui/app/wizard/WizardStep';
import {FormIcon} from 'lib-admin-ui/app/wizard/FormIcon';
import {i18n} from 'lib-admin-ui/util/Messages';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {SchemaWizardActions} from './SchemaWizardActions';
import {WizardHeaderWithDisplayNameAndName} from 'lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {Schema, SchemaBuilder} from '../schema/Schema';
import {ResourceWizardStepForm} from './ResourceWizardStepForm';
import {UpdateSchemaRequest} from '../../graphql/schema/UpdateSchemaRequest';
import {CreateSchemaRequest} from '../../graphql/schema/CreateSchemaRequest';
import {ModelName} from '../schema/ModelName';
import {DeleteSchemaRequest} from '../../graphql/schema/DeleteSchemaRequest';
import {DeleteModelResult} from '../../graphql/schema/DeleteModelResult';
import {SchemaType} from '../schema/SchemaType';

export class SchemaWizardPanel
    extends ModelWizardPanel<Schema> {

    private resourceWizardStepForm: ResourceWizardStepForm;

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

    protected getPersistedName(): string {
        return this.getPersistedItem() ? this.getPersistedItem().getName().getName().toString() : null;
    }

    protected doLoadData(): Q.Promise<Schema> {
        if (SchemaWizardPanel.debug) {
            console.debug('SchemaWizardPanel.doLoadData');
        }

        return Q(this.params.persistedItem);
    }

    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            if (SchemaWizardPanel.debug) {
                console.debug('SchemaWizardPanel.doRenderOnDataLoaded');
            }

            this.addClass('model-wizard-panel');
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

        steps.push(new WizardStep(i18n('field.resource'), this.resourceWizardStepForm));

        return steps;
    }

    protected getPersistedItemPath(): string {
        return `/${this.getPersistedItem().getName().toString()}`;
    }

    getType(): string {
        return i18n('field.schema');
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
        // this.lock();

        return new CreateSchemaRequest()
            .setSchema(this.assembleViewedSchema()).sendAndParse().then((createdSchema: Schema) => {
                showFeedback('Schema was created');
                // new UserItemUpdatedEvent(null, updatedSchema).fire();

                return createdSchema;
            })/*.finally(this.unlock.bind(this))*/;
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
                    throw i18n('notify.invalid.schema');
                });
            }
        }
        return super.saveChanges();
    }

    isNewChanged(): boolean {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               (this.getPersistedItem() ? !ObjectHelper.stringEquals(this.resourceWizardStepForm.getResource(),
                   this.getPersistedItem().getResource()) : !!this.resourceWizardStepForm.getResource());
    }

    isPersistedEqualsViewed(): boolean {
        const viewedSchema: Schema = this.assembleViewedSchema();
        return viewedSchema.equals(this.getPersistedItem());
    }

    protected doLayoutPersistedItem(persistedItem: Schema): Q.Promise<void> {
        if (!!persistedItem) {
            this.getWizardHeader().setDisplayName(persistedItem.getDisplayName() || '');
            this.resourceWizardStepForm.layout(persistedItem.getResource());
        } else {
            this.resourceWizardStepForm.layout(null);
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
            .setName(ModelName.create()
                .setName(this.getWizardHeader().getName())
                .setApplicationKey(params.applicationKey)
                .build())
            .setDisplayName(this.getWizardHeader().getDisplayName())
            .build();
    }

    protected handleSuccessfulDelete(result: DeleteModelResult<ModelName>[]): void {
        if (result) {
            let id;

            id = result[0].getId();

            showFeedback(
                i18n('notify.delete.schema.single', id.toString()));
        }

        this.close();
        // UserItemDeletedEvent.create().setIdProviders([this.getPersistedItem()]).build().fire();
    }

    protected produceDeleteRequest(): DeleteSchemaRequest {
        return new DeleteSchemaRequest().setIds([this.getPersistedItem().getName()]).setType(
            SchemaType[this.getPersistedItem().getType().toString()]) as DeleteSchemaRequest;
    }

}
