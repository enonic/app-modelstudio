import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';

export interface ModelWizardData<TYPE> {

    getApplicationKey(): ApplicationKey;

    getType(): TYPE;

    getName?(): string;
}
