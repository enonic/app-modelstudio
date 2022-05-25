import * as Q from 'q';
import {Router} from '../Router';
import {ModelWizardPanel} from './ModelWizardPanel';
import {WizardStep} from 'lib-admin-ui/app/wizard/WizardStep';
import {FormIcon} from 'lib-admin-ui/app/wizard/FormIcon';
import {i18n} from 'lib-admin-ui/util/Messages';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {WizardHeaderWithDisplayNameAndName} from 'lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {Application, ApplicationBuilder} from '../application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ApplicationWizardPanelParams} from './ApplicationWizardPanelParams';
import {ApplicationWizardActions} from './ApplicationWizardActions';
import {CreateApplicationRequest} from '../../graphql/application/CreateApplicationRequest';
import {DeleteApplicationRequest} from '../../graphql/application/DeleteApplicationRequest';
import {DeleteModelResult} from '../../graphql/schema/DeleteModelResult';


export class ApplicationWizardPanel
    extends ModelWizardPanel<Application> {

    public static debug: boolean = false;

    constructor(params: ApplicationWizardPanelParams) {
        super(params);
    }

    protected createWizardActions(): ApplicationWizardActions {
        return new ApplicationWizardActions(this);
    }

    protected getPersistedModelId(): string {
        return this.getPersistedItem() ? this.getPersistedItem().getApplicationKey().toString() : null;
    }

    protected getPersistedName(): string {
        return this.getPersistedItem() ? this.getPersistedItem().getApplicationKey().getName().toString() : null;
    }

    protected doLoadData(): Q.Promise<Application> {
        if (ApplicationWizardPanel.debug) {
            console.debug('ApplicationWizardPanel.doLoadData');
        }

        return Q(this.params.persistedItem);
    }

    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            if (ApplicationWizardPanel.debug) {
                console.debug('ApplicationWizardPanel.doRenderOnDataLoaded');
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

    createSteps(persistedItem: Application): WizardStep[] {
        const steps: WizardStep[] = [];
        return steps;
    }

    protected getPersistedItemPath(): string {
        return `/${this.getPersistedItem().getApplicationKey().toString()}`;
    }

    getType(): string {
        return i18n('field.application');
    }

    doLayout(persistedApplication: Application): Q.Promise<void> {
        return super.doLayout(persistedApplication).then(() => {

            if (this.isRendered()) {
                return Q<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedApplication ? persistedApplication.clone() : null);
            }

        });
    }

    persistNewItem(): Q.Promise<Application> {
        // this.lock();

        const viewedApplication: Application = this.assembleViewedApplication();

        return new CreateApplicationRequest()
            .setKey(viewedApplication.getApplicationKey()).sendAndParse().then(
                (createdApplication: Application) => {
                    showFeedback('Application was created');
                    // new UserItemUpdatedEvent(null, updatedSchema).fire();

                    return createdApplication;
                })/*.finally(this.unlock.bind(this))*/;
    }

    postPersistNewItem(application: Application): Q.Promise<Application> {
        Router.setHash('edit/' + application.getApplicationKey());
        return Q(application);
    }

    updatePersistedItem(): Q.Promise<Application> {
        return Q(this.getPersistedItem());
    }

    isNewChanged(): boolean {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '';
    }

    isPersistedEqualsViewed(): boolean {
        const viewedApplication: Application = this.assembleViewedApplication();
        return ObjectHelper.objectEquals(viewedApplication.getApplicationKey(), this.getPersistedItem().getApplicationKey()) ||
               ObjectHelper.objectEquals(viewedApplication.getDisplayName(), this.getPersistedItem().getDisplayName());
    }

    protected doLayoutPersistedItem(persistedItem: Application): Q.Promise<void> {
        if (!!persistedItem) {
            this.getWizardHeader().setDisplayName(persistedItem.getDisplayName() || '');
            this.getWizardHeader().setName(persistedItem.getApplicationKey().toString() || '');
        }

        return Q<void>(null);
    }

    protected updateHash(): void {
        if (this.getPersistedItem()) {
            Router.setHash('edit/' + this.getPersistedModelId());
        } else {
            Router.setHash('new/');
        }
    }

    private assembleViewedApplication(): Application {
        const params = (this.params as ApplicationWizardPanelParams);

        return new ApplicationBuilder()
            .setApplicationKey(ApplicationKey.fromString(this.getWizardHeader().getName()))
            .setDisplayName(this.getWizardHeader().getDisplayName())
            .build();
    }

    protected handleSuccessfulDelete(result: DeleteModelResult<ApplicationKey>): void {
        if (result.getResult()) {
            showFeedback(
                i18n('notify.delete.application.single', result.getId().toString()));
        }

        this.close();
    }

    protected produceDeleteRequest(): DeleteApplicationRequest {
        return new DeleteApplicationRequest().setKey(this.getPersistedItem().getApplicationKey());
    }
}
