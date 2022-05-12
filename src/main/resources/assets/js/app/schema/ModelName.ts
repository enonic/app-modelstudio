import {Cloneable} from 'lib-admin-ui/Cloneable';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';


export class ModelName
    implements Cloneable, Equitable {

    private readonly applicationKey: ApplicationKey;

    private readonly name: string;

    constructor(builder: SchemaNameBuilder) {
        this.applicationKey = builder.applicationKey;
        this.name = builder.name;
    }

    static fromString(value: string): ModelName {
        return SchemaNameBuilder.fromString(value).build();
    }

    getApplicationKey(): ApplicationKey {
        return this.applicationKey;
    }

    getName(): string {
        return this.name;
    }

    clone(): ModelName {
        return new SchemaNameBuilder(this).build();
    }

    toString(): string {
        return this.applicationKey + ':' + this.name;
    }

    static create(): SchemaNameBuilder {
        return new SchemaNameBuilder();
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, ModelName)) {
            return false;
        }

        let other = <ModelName>o;

        return this.name === other.getName() &&
               ObjectHelper.objectEquals(this.applicationKey, other.getApplicationKey());
    }
}

export class SchemaNameBuilder {

    name: string;

    applicationKey: ApplicationKey;

    constructor(source?: ModelName) {
        if (source) {
            this.name = source.getName();
            this.applicationKey = source.getApplicationKey();
        }
    }

    static fromString(value: string): SchemaNameBuilder {
        const elements: string[] = value.split(':');

        return new SchemaNameBuilder()
            .setApplicationKey(ApplicationKey.fromString(elements[0]))
            .setName(elements[1]);
    }

    public setApplicationKey(value: ApplicationKey): SchemaNameBuilder {
        this.applicationKey = value;
        return this;
    }

    public setName(value: string): SchemaNameBuilder {
        this.name = value;
        return this;
    }

    public build(): ModelName {
        return new ModelName(this);
    }
}
