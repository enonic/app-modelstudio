import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {SiteJson} from './SiteJson';


export class Site
    implements Equitable {

    private readonly key: ApplicationKey;

    private readonly resource: string;

    constructor(builder: SiteBuilder) {
        this.key = builder.key;
        this.resource = builder.resource;
    }

    static fromJson(json: SiteJson): Site {
        return SiteBuilder.fromJson(json).build();
    }

    getKey(): ApplicationKey {
        return this.key;
    }

    getResource(): string {
        return this.resource;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Site)) {
            return false;
        }

        let other = <Site>o;

        return ObjectHelper.objectEquals(this.key, other.getKey()) &&
               ObjectHelper.stringEquals(this.resource, other.getResource()) ;
    }
}

export class SiteBuilder {

    key: ApplicationKey;

    resource: string;

    constructor(source?: Site) {
        if (source) {
            this.key = source.getKey();
            this.resource = source.getResource();
        }
    }

    static fromJson(json: SiteJson): SiteBuilder {
        // const descriptorKey: DescriptorKey = DescriptorKey.fromString(json.key);
        return new SiteBuilder()
            .setKey(ApplicationKey.fromString(json.key))
            .setResource(json.resource);
    }

    public setKey(value: ApplicationKey): SiteBuilder {
        this.key = value;
        return this;
    }

    public setResource(value: string): SiteBuilder {
        this.resource = value;
        return this;
    }

    public build(): Site {
        return new Site(this);
    }
}
