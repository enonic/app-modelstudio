import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ApplicationJson} from './ApplicationJson';

export class Application {

    private readonly applicationKey: ApplicationKey;

    private readonly displayName: string;

    private readonly description: string;

    private readonly icon: string;


    constructor(builder: ApplicationBuilder) {
        this.applicationKey = builder.applicationKey;
        this.displayName = builder.displayName;
        this.icon = builder.icon;
    }

    getApplicationKey(): ApplicationKey {
        return this.applicationKey;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    getDescription(): string {
        return this.description;
    }

    getIcon(): string {
        return this.icon;
    }

    static create(): ApplicationBuilder {
        return new ApplicationBuilder();
    }

    static fromJson(json: ApplicationJson): Application {
        return new ApplicationBuilder().fromJson(json).build();
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Application)) {
            return false;
        }

        let other = <Application>o;

        if (!ObjectHelper.equals(this.applicationKey, other.applicationKey)) {
            return false;
        }
        if (!ObjectHelper.stringEquals(this.displayName, other.displayName)) {
            return false;
        }
        if (!ObjectHelper.stringEquals(this.description, other.description)) {
            return false;
        }
        if (!ObjectHelper.stringEquals(this.icon, other.icon)) {
            return false;
        }
        return true;
    }

    clone(): Application {
        return this.newBuilder().build();
    }

    newBuilder(): ApplicationBuilder {
        return new ApplicationBuilder(this);
    }
}

export class ApplicationBuilder {

    applicationKey: ApplicationKey;

    displayName: string;

    description: string;

    icon: string;

    constructor(source?: Application) {
        if (source) {
            this.applicationKey = source.getApplicationKey();
            this.displayName = source.getDisplayName();
            this.description = source.getDescription();
            this.icon = source.getIcon();
        }
    }

    fromJson(json: ApplicationJson): ApplicationBuilder {
        this.applicationKey = new ApplicationKey(json.key);
        this.displayName = json.displayName;
        this.description = json.description;
        this.icon = json.icon;
        return this;
    }

    setApplicationKey(value: ApplicationKey): ApplicationBuilder {
        this.applicationKey = value;
        return this;
    }

    setDisplayName(value: string): ApplicationBuilder {
        this.displayName = value;
        return this;
    }

    setIcon(value: string): ApplicationBuilder {
        this.icon = value;
        return this;
    }

    build(): Application {
        return new Application(this);
    }
}
