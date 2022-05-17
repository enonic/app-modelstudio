import {DynamicWizardPanelParams} from './DynamicWizardPanelParams';
import {IdProvider} from '../principal/IdProvider';
import {Schema} from '../schema/Schema';
import {ComponentType} from '../schema/ComponentType';
import {SchemaType} from '../schema/SchemaType';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';


export class SchemaWizardPanelParams
    extends DynamicWizardPanelParams<Schema> {

     type: SchemaType;

    setType(value: SchemaType): SchemaWizardPanelParams {
        this.type = value;
        return this;
    }

}
