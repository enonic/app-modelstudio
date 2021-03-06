import * as Q from 'q';
import {Router} from '../Router';
import {ModelWizardPanel} from './ModelWizardPanel';
import {WizardStep} from '@enonic/lib-admin-ui/app/wizard/WizardStep';
import {FormIcon} from '@enonic/lib-admin-ui/app/wizard/FormIcon';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {WizardHeaderWithDisplayNameAndName} from '@enonic/lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {ResourceWizardStepForm} from './ResourceWizardStepForm';
import {ModelName} from '../schema/ModelName';
import {DeleteModelResult} from '../../graphql/schema/DeleteModelResult';
import {Component, ComponentBuilder} from '../schema/Component';
import {ComponentWizardPanelParams} from './ComponentWizardPanelParams';
import {ComponentWizardActions} from './ComponentWizardActions';
import {CreateComponentRequest} from '../../graphql/schema/CreateComponentRequest';
import {UpdateComponentRequest} from '../../graphql/schema/UpdateComponentRequest';
import {DeleteComponentRequest} from '../../graphql/schema/DeleteComponentRequest';
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

    createSteps(persistedItem: Component): WizardStep[] {
        const steps: WizardStep[] = [];

        this.resourceWizardStepForm = new ResourceWizardStepForm();
        this.resourceWizardStepForm.onDataChanged(() => this.updateSaveButtonState());

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
            (this.getPersistedItem() ?
                !ObjectHelper.stringEquals(this.resourceWizardStepForm.getResource(), this.getPersistedItem().getResource()) :
                !!this.resourceWizardStepForm.getResource());
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
    }

    protected produceDeleteRequest(): DeleteComponentRequest {
        return new DeleteComponentRequest().setIds([this.getPersistedItem().getName()]).setType(
            ComponentType[this.getPersistedItem().getType().toString()]) as DeleteComponentRequest;
    }

}
