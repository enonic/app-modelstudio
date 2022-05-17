import {UserItemWizardActions} from './action/UserItemWizardActions';
import {IdProvider} from '../principal/IdProvider';
import {Schema} from '../schema/Schema';
import {Application} from '../application/Application';

export class ApplicationWizardActions
    extends UserItemWizardActions<Application> {

    enableActionsForExisting(application: Application) {
        this.save.setEnabled(false);
    }

}
