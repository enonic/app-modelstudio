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
import {UpdateSchemaRequest} from '../../graphql/apps/UpdateSchemaRequest';
import {CreateSchemaRequest} from '../../graphql/apps/CreateSchemaRequest';
import {ModelName} from '../schema/ModelName';
import {DeleteSchemaRequest} from '../../graphql/apps/DeleteSchemaRequest';
import {DeleteModelResult} from '../../graphql/apps/DeleteModelResult';
import {SchemaType} from '../schema/SchemaType';
import {Component, ComponentBuilder} from '../schema/Component';
import {ComponentWizardPanelParams} from './ComponentWizardPanelParams';
import {ComponentWizardActions} from './ComponentWizardActions';
import {CreateComponentRequest} from '../../graphql/apps/CreateComponentRequest';
import {UpdateComponentRequest} from '../../graphql/apps/UpdateComponentRequest';
import {DeleteComponentRequest} from '../../graphql/apps/DeleteComponentRequest';
import {ComponentType} from '../schema/ComponentType';

export class ComponentWizardPanel
    extends ModelWizardPanel<Component> {

    private resourceWizardStepForm: ResourceWizardStepForm;

    public static debug: boolean = false;

    constructor(params: ComponentWizardPanelParams) {
        super(params);

        // this.listenToUserItemEvents();
    }

    protected createWizardActions(): ComponentWizardActions {
        return new ComponentWizardActions(this);
    }

    protected getPersistedModelId(): string {
        return this.getPersistedItem() ? this.getPersistedItem().getName().toString() : null;
    }

    protected getPersistedName(): string {
        return this.getPersistedItem() ? this.getPersistedItem().getName().getName().toString() : null;
    }

    protected doLoadData(): Q.Promise<Component> {
        if (ComponentWizardPanel.debug) {
            console.debug('ComponentWizardPanel.doLoadData');
        }

        return Q(this.params.persistedItem);
    }

    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            if (ComponentWizardPanel.debug) {
                console.debug('ComponentWizardPanel.doRenderOnDataLoaded');
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

    createSteps(persistedItem: Component): WizardStep[] {
        const steps: WizardStep[] = [];

        this.resourceWizardStepForm = new ResourceWizardStepForm();

        steps.push(new WizardStep(i18n('field.resource'), this.resourceWizardStepForm));

        return steps;
    }

    protected getPersistedItemPath(): string {
        return `/${this.getPersistedItem().getName().toString()}`;
    }

    getType(): string {
        return i18n('field.component');
    }

    doLayout(persistedComponent: Component): Q.Promise<void> {
        return super.doLayout(persistedComponent).then(() => {

            if (this.isRendered()) {
                return Q<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedComponent ? persistedComponent.clone() : null);
            }

        });
    }

    persistNewItem(): Q.Promise<Component> {
        this.lock();

        return new CreateComponentRequest()
            .setComponent(this.assembleViewedComponent()).sendAndParse().then((createdComponent: Component) => {
                showFeedback('Component was created');
                // new UserItemUpdatedEvent(null, updatedSchema).fire();

                return createdComponent;
            }).finally(this.unlock.bind(this));
    }

    postPersistNewItem(component: Component): Q.Promise<Component> {
        Router.setHash('edit/' + component.getName());
        return Q(component);
    }

    updatePersistedItem(): Q.Promise<Component> {
        this.lock();

        return new UpdateComponentRequest()
            .setComponent(this.assembleViewedComponent()).sendAndParse().then((updatedComponent: Component) => {
                showFeedback('Component was updated');
                // new UserItemUpdatedEvent(null, updatedSchema).fire();

                return updatedComponent;
            }).finally(this.unlock.bind(this));
    }

    saveChanges(): Q.Promise<Component> {
        if (this.isRendered()) {
            if (!this.resourceWizardStepForm.isValid()) {
                return Q.fcall(() => {
                    throw i18n('notify.invalid.component');
                });
            }
        }
        return super.saveChanges();
    }

    isNewChanged(): boolean {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               (this.getPersistedItem() ? !ObjectHelper.stringEquals(this.resourceWizardStepForm.getResource(), this.getPersistedItem().getResource()) : !!this.resourceWizardStepForm.getResource()) ;
    }

    isPersistedEqualsViewed(): boolean {
        const viewedComponent: Component = this.assembleViewedComponent();
        return viewedComponent.equals(this.getPersistedItem());
    }

    protected doLayoutPersistedItem(persistedItem: Component): Q.Promise<void> {
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

    private assembleViewedComponent(): Component {
        const params = (this.params as ComponentWizardPanelParams);

        return new ComponentBuilder()
            .setResource(this.resourceWizardStepForm.getResource())
            .setType(params.type)
            .setName(ModelName.create()
                .setName(this.getWizardHeader().getName())
                .setApplicationKey(params.applicationKey)
                .build())
            .setDisplayName(this.getWizardHeader().getDisplayName())
            // .setModifiedTime(this.getPersistedItem() ? this.getPersistedItem().getModifiedTime() : null)
            .build();
    }

    protected handleSuccessfulDelete(result: DeleteModelResult<ModelName>[]): void {
        if (result) {
            let id;

            id = result[0].getId();

            showFeedback(
                i18n('notify.delete.component.single', id.toString()));
        }

        this.close();
        // UserItemDeletedEvent.create().setIdProviders([this.getPersistedItem()]).build().fire();
    }

    protected produceDeleteRequest(): DeleteComponentRequest {
        return new DeleteComponentRequest().setIds([this.getPersistedItem().getName()]).setType(
            ComponentType[this.getPersistedItem().getType().toString()]) as DeleteComponentRequest;
    }

}
