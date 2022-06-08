import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {StylesJson} from './StylesJson';


export class Styles
    implements Equitable {

    private readonly key: ApplicationKey;

    private readonly resource: string;

    constructor(builder: StylesBuilder) {
        this.key = builder.key;
        this.resource = builder.resource;
    }

    static fromJson(json: StylesJson): Styles {
        return StylesBuilder.fromJson(json).build();
    }

    getKey(): ApplicationKey {
        return this.key;
    }

    getResource(): string {
        return this.resource;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Styles)) {
            return false;
        }

        let other = <Styles>o;

        return ObjectHelper.objectEquals(this.key, other.getKey()) &&
               ObjectHelper.stringEquals(this.resource, other.getResource()) ;
    }
}

export class StylesBuilder {

    key: ApplicationKey;

    resource: string;

    constructor(source?: Styles) {
        if (source) {
            this.key = source.getKey();
            this.resource = source.getResource();
        }
    }

    static fromJson(json: StylesJson): StylesBuilder {
        // const descriptorKey: DescriptorKey = DescriptorKey.fromString(json.key);
        return new StylesBuilder()
            .setKey(ApplicationKey.fromString(json.key))
            .setResource(json.resource);
    }

    public setKey(value: ApplicationKey): StylesBuilder {
        this.key = value;
        return this;
    }

    public setResource(value: string): StylesBuilder {
        this.resource = value;
        return this;
    }

    public build(): Styles {
        return new Styles(this);
    }
}
