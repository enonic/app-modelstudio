import {ModelWizardActions} from './action/ModelWizardActions';
import {Schema} from '../schema/Schema';

export class SchemaWizardActions
    extends ModelWizardActions<Schema> {

    enableActionsForExisting(schema: Schema) {
        this.save.setEnabled(false);
    }
}
