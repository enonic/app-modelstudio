import {ModelWizardPanel} from '../ModelWizardPanel';
import {DeleteModelAction} from './DeleteModelAction';
import {WizardActions} from '@enonic/lib-admin-ui/app/wizard/WizardActions';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {SaveAction} from '@enonic/lib-admin-ui/app/wizard/SaveAction';
import {CloseAction} from '@enonic/lib-admin-ui/app/wizard/CloseAction';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';

export class ModelWizardActions<USER_ITEM_TYPE extends Equitable>
    extends WizardActions<USER_ITEM_TYPE> {

    protected save: Action;

    protected close: Action;

    protected delete: Action;

    constructor(wizardPanel: ModelWizardPanel<USER_ITEM_TYPE>) {
        super();

        this.save = new SaveAction(wizardPanel);
        this.delete = new DeleteModelAction();
        this.close = new CloseAction(wizardPanel);

        this.setActions(this.save, this.delete, this.close);
    }

    enableActionsForNew(): void {
        this.save.setEnabled(false);
        this.delete.setEnabled(false);
    }

    enableActionsForExisting(userItem: USER_ITEM_TYPE): void {
        this.save.setEnabled(false);
    }

    getDeleteAction(): Action {
        return this.delete;
    }

    getSaveAction(): Action {
        return this.save;
    }

    getCloseAction(): Action {
        return this.close;
    }

}
