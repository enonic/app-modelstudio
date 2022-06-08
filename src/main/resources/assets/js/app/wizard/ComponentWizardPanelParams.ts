import {DynamicWizardPanelParams} from './DynamicWizardPanelParams';
import {Component} from '../schema/Component';
import {ComponentType} from '../schema/ComponentType';

export class ComponentWizardPanelParams
    extends DynamicWizardPanelParams<Component> {

    type: ComponentType;

    setType(value: ComponentType): ComponentWizardPanelParams {
        this.type = value;
        return this;
    }
}
