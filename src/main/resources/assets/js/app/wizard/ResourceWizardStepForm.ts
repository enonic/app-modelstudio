import {FormItem, FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {i18n} from 'lib-admin-ui/util/Messages';
import {TextArea} from 'lib-admin-ui/ui/text/TextArea';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {Schema} from '../schema/Schema';

export class ResourceWizardStepForm
    extends UserItemWizardStepForm {

    private resource: TextArea;

    constructor() {
        super('resource-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.resource = new TextArea('middle');
    }

    protected initListeners(): void {
        super.initListeners();
    }

    protected createFormItems(): FormItem[] {
        const resourceFormItem: FormItem = new FormItemBuilder(this.resource).setLabel(i18n('field.description')).build();
        return [resourceFormItem];
    }

    layout(resource: string): void {

        const value = resource || '';

        if (this.resource.isDirty()) {
            if (ObjectHelper.stringEquals(this.resource.getValue(), value)) {
                this.resource.resetBaseValues();
            }
        } else {
            this.resource.setValue(value);
        }
    }

    getResource(): string {
        return this.resource.getValue();
    }

    giveFocus(): boolean {
        return this.resource.giveFocus();
    }


    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            // this.applicationComboBox.addClass('application-configurator');

            return rendered;
        });
    }
}
