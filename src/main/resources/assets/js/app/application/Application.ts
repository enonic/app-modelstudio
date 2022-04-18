import * as Q from 'q';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {UserItemKey} from 'lib-admin-ui/security/UserItemKey';
import {ApplicationJson} from './ApplicationJson';
import {UserItem, UserItemBuilder} from 'lib-admin-ui/security/UserItem';

export class Application
    /*extends UserItem*/ {

    private readonly applicationKey: ApplicationKey;

    private readonly displayName: string;

    private readonly modifiedTime: Date;

    private readonly description: string;

    private readonly icon: string;


    constructor(builder: ApplicationBuilder) {
        // super(builder);
        this.applicationKey = builder.applicationKey;
        this.displayName = builder.displayName;
        this.modifiedTime = builder.modifiedTime;
        this.icon = builder.icon;
    }

    getApplicationKey(): ApplicationKey {
        return this.applicationKey;
    }

    getModifiedTime(): Date {
        return this.modifiedTime;
    }

    getDisplayName() :string {
        return this.displayName;
    }

    getDescription() :string {
        return this.description;
    }

    getIcon() :string {
        return this.icon;
    }


    //
    // getDisplayName(): string {
    //     return this.displayName;
    // }

    isDeletable(): Q.Promise<boolean> {
        return Q(false);
    }

    static create(): ApplicationBuilder {
        return new ApplicationBuilder();
    }

    static fromJson(json: ApplicationJson ): Application {
        return new ApplicationBuilder().fromJson(json).build();
    }

    equals(o: Equitable, ignoreEmptyValues: boolean = false): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Application)) {
            return false;
        }

        let other = <Application> o;

        if (!ObjectHelper.equals(this.applicationKey, other.applicationKey)) {
            return false;
        }
        if (!ObjectHelper.stringEquals(this.displayName, other.displayName)) {
            return false;
        }
        if (!ObjectHelper.dateEquals(this.modifiedTime, other.modifiedTime)) {
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

export class ApplicationBuilder
    /*extends UserItemBuilder*/ {

    applicationKey: ApplicationKey;

    displayName: string;

    modifiedTime: Date;

    description: string;

    icon: string;

    constructor(source?: Application) {
        if (source) {
            // super(source);
            this.applicationKey = source.getApplicationKey();
            this.displayName = source.getDisplayName();
            this.modifiedTime = source.getModifiedTime();
            this.description = source.getDescription();
            this.icon = source.getIcon();
        }
    }

    fromJson(json: ApplicationJson): ApplicationBuilder {
        // super.fromJson(json);
        this.applicationKey = new ApplicationKey(json.key);
        this.displayName = json.displayName;
        this.modifiedTime = json.modifiedTime;
        this.description = json.description;
        this.icon = json.icon;
        return this;
    }

    // setKey(key: string): ApplicationBuilder {
    //     this.applicationKey = ApplicationKey.fromString(key);
    //     return this;
    // }

    build(): Application {
        return new Application(this);
    }
}
