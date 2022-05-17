import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ComponentType} from './schema/ComponentType';
import {ModelWizardData} from './ModelWizardData';

export class ComponentWizardData
    implements ModelWizardData<ComponentType> {

    private readonly type: ComponentType;

    private readonly key: ApplicationKey;

    private readonly name?: string;

    constructor(type: ComponentType, key: ApplicationKey, name?: string) {
        this.type = type;
        this.key = key;
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    getType(): ComponentType {
        return this.type;
    }

    getApplicationKey(): ApplicationKey {
        return this.key;
    }
}
