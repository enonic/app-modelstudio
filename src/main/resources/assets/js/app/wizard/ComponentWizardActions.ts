import {ModelWizardActions} from './action/ModelWizardActions';
import {Component} from '../schema/Component';

export class ComponentWizardActions
    extends ModelWizardActions<Component> {

    enableActionsForExisting(component: Component) {
        this.save.setEnabled(false);
    }

}
