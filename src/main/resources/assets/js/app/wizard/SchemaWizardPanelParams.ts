import {DynamicWizardPanelParams} from './DynamicWizardPanelParams';
import {Schema} from '../schema/Schema';
import {SchemaType} from '../schema/SchemaType';

export class SchemaWizardPanelParams
    extends DynamicWizardPanelParams<Schema> {

     type: SchemaType;

    setType(value: SchemaType): SchemaWizardPanelParams {
        this.type = value;
        return this;
    }

}
