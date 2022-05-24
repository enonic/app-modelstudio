import {ModelWizardActions} from './action/ModelWizardActions';
import {Application} from '../application/Application';

export class ApplicationWizardActions
    extends ModelWizardActions<Application> {

    enableActionsForExisting(application: Application) {
        this.save.setEnabled(false);
    }

}
