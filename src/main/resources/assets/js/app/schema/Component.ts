import {Cloneable} from '@enonic/lib-admin-ui/Cloneable';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {ComponentType} from './ComponentType';
import {ComponentJson} from './ComponentJson';
import {ModelName} from './ModelName';

export class Component
    implements Cloneable, Equitable {

    private readonly name: ModelName;

    private readonly displayName: string;

    private readonly description: string;

    private readonly resource: string;

    private readonly type: ComponentType;

    private readonly icon: string;

    constructor(builder: ComponentBuilder) {
        this.name = builder.name;
        this.displayName = builder.displayName;
        this.description = builder.description;
        this.type = builder.type;
        this.resource = builder.resource;
        this.icon = builder.icon;
    }

    static fromJson(json: ComponentJson): Component {
        return ComponentBuilder.fromJson(json).build();
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

    getType(): ComponentType {
        return this.type;
    }

    getResource(): string {
        return this.resource;
    }

    getIcon(): string {
        return this.icon;
    }

    clone(): Component {
        return new ComponentBuilder(this).build();
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Component)) {
            return false;
        }

        let other = <Component>o;

        return ObjectHelper.objectEquals(this.name,other.getName()) &&
                this.displayName === other.getDisplayName() &&
                this.description === other.getDescription() &&
                this.type === other.getType() &&
                this.icon === other.getIcon() &&
                this.resource === other.getResource();
    }
}

export class ComponentBuilder {

    name: ModelName;

    displayName: string;

    description: string;

    type: ComponentType;

    resource: string;

    icon: string;

    constructor(source?: Component) {
        if (source) {
            this.name = source.getName();
            this.displayName = source.getDisplayName();
            this.description = source.getDescription();
            this.type = source.getType();
            this.resource = source.getResource();
            this.icon = source.getIcon();
        }
    }

    static fromJson(json: ComponentJson): ComponentBuilder {
        const modelName: ModelName = ModelName.fromString(json.name);

        return new ComponentBuilder()
            .setName(modelName)
            .setDisplayName(json.displayName || modelName.getName())
            .setDescription(json.description)
            .setType(ComponentType[json.type.toUpperCase()])
            .setResource(json.resource)
            .setIcon(json.icon);
    }

    public setName(value: ModelName): ComponentBuilder {
        this.name = value;
        return this;
    }

    public setDisplayName(value: string): ComponentBuilder {
        this.displayName = value;
        return this;
    }

    public setDescription(value: string): ComponentBuilder {
        this.description = value;
        return this;
    }

    public setType(value: ComponentType): ComponentBuilder {
        this.type = value;
        return this;
    }

    public setResource(value: string): ComponentBuilder {
        this.resource = value;
        return this;
    }

    public setIcon(value: string): ComponentBuilder {
        this.icon = value;
        return this;
    }

    public build(): Component {
        return new Component(this);
    }
}
