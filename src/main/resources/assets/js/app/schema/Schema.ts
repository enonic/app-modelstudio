import {Cloneable} from 'lib-admin-ui/Cloneable';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {SchemaType} from './SchemaType';
import {SchemaJson} from './SchemaJson';
import {SchemaName} from './SchemaName';

export class Schema
    implements Cloneable, Equitable {

    private readonly name: SchemaName;

    private readonly displayName: string;

    private readonly description: string;

    private readonly resource: string;

    private readonly type: SchemaType;

    private readonly icon: string;

    private readonly createdTime: Date;

    private readonly modifiedTime: Date;


    // private readonly regions: RegionDescriptor[];


    constructor(builder: SchemaBuilder) {
        this.name = builder.name;
        this.displayName = builder.displayName;
        this.description = builder.description;
        this.type = builder.type;
        this.resource = builder.resource;
        this.icon = builder.icon;
        this.createdTime = builder.createdTime;
        this.modifiedTime = builder.modifiedTime;
    }

    static fromJson(json: SchemaJson): Schema {
        return SchemaBuilder.fromJson(json).build();
    }

     getName(): SchemaName {
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

    getCreatedTime(): Date {
        return this.createdTime;
    }

    getModifiedTime(): Date {
        return this.modifiedTime;
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
               ObjectHelper.dateEquals(this.createdTime, other.createdTime) &&
               ObjectHelper.dateEquals(this.modifiedTime, other.modifiedTime) &&
               this.resource === other.getResource();
        // && this.config.equals(other.getConfig()) &&
        // ObjectHelper.arrayEquals(this.regions, other.getRegions());
    }
}

export class SchemaBuilder {

    name: SchemaName;

    displayName: string;

    description: string;

    type: SchemaType;

    resource: string;

    icon: string;

    modifiedTime: Date;

    createdTime: Date;

    constructor(source?: Schema) {
        if (source) {
            this.name = source.getName();
            this.displayName = source.getDisplayName();
            this.description = source.getDescription();
            this.type = source.getType();
            this.resource = source.getResource();
            this.icon = source.getIcon();
            this.modifiedTime = source.getModifiedTime();
            this.createdTime = source.getCreatedTime();
        }
    }

    static fromJson(json: SchemaJson): SchemaBuilder {
        // const descriptorKey: DescriptorKey = DescriptorKey.fromString(json.key);
        return new SchemaBuilder()
            .setName(SchemaName.fromString(json.name))
            .setDisplayName(json.displayName)
            .setDescription(json.description)
            .setType(SchemaType[json.type.toUpperCase()])
            .setResource(json.resource)
            .setIcon(json.icon)
            .setModifiedTime(json.modifiedTime ? new Date(json.modifiedTime) : null)
            .setCreatedTime(json.createdTime ? new Date(json.createdTime) : null);
    }

    public setName(value: SchemaName): SchemaBuilder {
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

    public setModifiedTime(value: Date): SchemaBuilder {
        this.modifiedTime = value;
        return this;
    }

    public setCreatedTime(value: Date): SchemaBuilder {
        this.createdTime = value;
        return this;
    }

    public build(): Schema {
        return new Schema(this);
    }
}
