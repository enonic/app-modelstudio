import {Cloneable} from 'lib-admin-ui/Cloneable';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';


export class SchemaName
    implements Cloneable, Equitable {

    private readonly applicationKey: ApplicationKey;

    private readonly localName: string;

    constructor(builder: SchemaNameBuilder) {
        this.applicationKey = builder.applicationKey;
        this.localName = builder.localName;
    }

    static fromString(value: string): SchemaName {
        return SchemaNameBuilder.fromString(value).build();
    }

    getApplicationKey(): ApplicationKey {
        return this.applicationKey;
    }

    getLocalName(): string {
        return this.localName;
    }

    clone(): SchemaName {
        return new SchemaNameBuilder(this).build();
    }

    toString(): string {
        return this.applicationKey + ':' + this.localName;
    }

    static create(): SchemaNameBuilder {
        return new SchemaNameBuilder();
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, SchemaName)) {
            return false;
        }

        let other = <SchemaName>o;

        return this.localName === other.getLocalName() &&
               ObjectHelper.objectEquals(this.applicationKey, other.getApplicationKey());
    }
}

export class SchemaNameBuilder {

    localName: string;

    applicationKey: ApplicationKey;

    constructor(source?: SchemaName) {
        if (source) {
            this.localName = source.getLocalName();
            this.applicationKey = source.getApplicationKey();
        }
    }

    static fromString(value: string): SchemaNameBuilder {
        const elements: string[] = value.split(':');

        return new SchemaNameBuilder()
            .setApplicationKey(ApplicationKey.fromString(elements[0]))
            .setLocalName(elements[1]);
    }

    public setApplicationKey(value: ApplicationKey): SchemaNameBuilder {
        this.applicationKey = value;
        return this;
    }

    public setLocalName(value: string): SchemaNameBuilder {
        this.localName = value;
        return this;
    }

    public build(): SchemaName {
        return new SchemaName(this);
    }
}
