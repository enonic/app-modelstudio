import {UserItemWizardActions} from './action/UserItemWizardActions';
import {IdProvider} from '../principal/IdProvider';
import {Schema} from '../schema/Schema';

export class SchemaWizardActions
    extends UserItemWizardActions<Schema> {

    enableActionsForExisting(schema: Schema) {
        this.save.setEnabled(false);

            // schema.isDeletable().then((isDeletable: boolean) => {
            //     this.delete.setEnabled(isDeletable);
            // });
    }

}
