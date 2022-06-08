import {Cloneable} from '@enonic/lib-admin-ui/Cloneable';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {SchemaType} from './SchemaType';
import {SchemaJson} from './SchemaJson';
import {ModelName} from './ModelName';

export class Schema
    implements Cloneable, Equitable {

    private readonly name: ModelName;

    private readonly displayName: string;

    private readonly description: string;

    private readonly resource: string;

    private readonly type: SchemaType;

    private readonly icon: string;

    constructor(builder: SchemaBuilder) {
        this.name = builder.name;
        this.displayName = builder.displayName;
        this.description = builder.description;
        this.type = builder.type;
        this.resource = builder.resource;
        this.icon = builder.icon;
    }

    static fromJson(json: SchemaJson): Schema {
        return SchemaBuilder.fromJson(json).build();
    }

     getName(): ModelName {
        return this.name;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    getDescription(): string {
        return this.description;
    }

    getType(): SchemaType {
        return this.type;
    }

    getResource(): string {
        return this.resource;
    }

    getIcon(): string {
        return this.icon;
    }

    clone(): Schema {
        return new SchemaBuilder(this).build();
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Schema)) {
            return false;
        }

        let other = <Schema>o;

        return ObjectHelper.objectEquals(this.name, other.getName()) &&
               this.displayName === other.getDisplayName() &&
               this.description === other.getDescription() &&
               this.type === other.getType() &&
               this.icon === other.getIcon() &&
               this.resource === other.getResource();
    }
}

export class SchemaBuilder {

    name: ModelName;

    displayName: string;

    description: string;

    type: SchemaType;

    resource: string;

    icon: string;

    constructor(source?: Schema) {
        if (source) {
            this.name = source.getName();
            this.displayName = source.getDisplayName();
            this.description = source.getDescription();
            this.type = source.getType();
            this.resource = source.getResource();
            this.icon = source.getIcon();
        }
    }

    static fromJson(json: SchemaJson): SchemaBuilder {
        // const descriptorKey: DescriptorKey = DescriptorKey.fromString(json.key);
        return new SchemaBuilder()
            .setName(ModelName.fromString(json.name))
            .setDisplayName(json.displayName)
            .setDescription(json.description)
            .setType(SchemaType[json.type.toUpperCase()])
            .setResource(json.resource)
            .setIcon(json.icon);
    }

    public setName(value: ModelName): SchemaBuilder {
        this.name = value;
        return this;
    }

    public setDisplayName(value: string): SchemaBuilder {
        this.displayName = value;
        return this;
    }

    public setDescription(value: string): SchemaBuilder {
        this.description = value;
        return this;
    }

    public setType(value: SchemaType): SchemaBuilder {
        this.type = value;
        return this;
    }

    public setResource(value: string): SchemaBuilder {
        this.resource = value;
        return this;
    }

    public setIcon(value: string): SchemaBuilder {
        this.icon = value;
        return this;
    }

    public build(): Schema {
        return new Schema(this);
    }
}
