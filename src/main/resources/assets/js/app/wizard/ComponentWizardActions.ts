import {UserItemWizardActions} from './action/UserItemWizardActions';
import {IdProvider} from '../principal/IdProvider';
import {Schema} from '../schema/Schema';
import {Component} from '../schema/Component';

export class ComponentWizardActions
    extends UserItemWizardActions<Component> {

    enableActionsForExisting(component: Component) {
        this.save.setEnabled(false);
    }

}
