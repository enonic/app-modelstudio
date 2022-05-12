import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {SchemaType} from './schema/SchemaType';
import {ModelWizardData} from './ModelWizardData';

export class SchemaWizardData
    implements ModelWizardData<SchemaType> {

    private readonly type: SchemaType;

    private readonly key: ApplicationKey;

    private readonly name?: string;

    constructor(type: SchemaType, key: ApplicationKey, name?: string) {
        this.type = type;
        this.key = key;
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    getType(): SchemaType {
        return this.type;
    }

    getApplicationKey(): ApplicationKey {
        return this.key;
    }
}
