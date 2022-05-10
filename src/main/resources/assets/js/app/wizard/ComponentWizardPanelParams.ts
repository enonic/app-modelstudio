import {DynamicWizardPanelParams} from './DynamicWizardPanelParams';
import {Component} from '../schema/Component';
import {ComponentType} from '../schema/ComponentType';

export class ComponentWizardPanelParams
    extends DynamicWizardPanelParams<Component> {

    component: Component;

    setComponent(value: Component): ComponentWizardPanelParams {
        this.component = value;
        return this;
    }
}
