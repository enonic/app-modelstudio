import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {Site} from '../schema/Site';
import {Application} from './Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';

export class RenderableApplication {

    private readonly application: Application;

    private readonly site: Site;

    constructor(builder: RenderableApplicationBuilder) {
        this.application = builder.application;
        this.site = builder.site;
    }

    getSite(): Site {
        return this.site;
    }

    getApplication(): Application {
        return this.application;
    }

    getApplicationKey(): ApplicationKey {
        return this.application.getApplicationKey();
    }

    getResource(): string {
        return this.site.getResource();
    }

    getDisplayName(): string {
        return this.application.getDisplayName();
    }

    getIcon(): string {
        return this.application.getIcon();
    }

    static create(): RenderableApplicationBuilder {
        return new RenderableApplicationBuilder();
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, RenderableApplication)) {
            return false;
        }

        let other = <RenderableApplication>o;

        if (!ObjectHelper.objectEquals(this.application, other.application)) {
            return false;
        }

        if (!ObjectHelper.objectEquals(this.site, other.site)) {
            return false;
        }
        return true;
    }

    clone(): RenderableApplication {
        return this.newBuilder().build();
    }

    newBuilder(): RenderableApplicationBuilder {
        return new RenderableApplicationBuilder(this);
    }
}

export class RenderableApplicationBuilder {
    application: Application;

    site: Site;

    constructor(source?: RenderableApplication) {
        if (source) {
            this.application = source.getApplication();
            this.site = source.getSite();
        }
    }

    setApplication(application: Application) {
        this.application = application;
        return this;
    }

    setSite(site: Site) {
        this.site = site;
        return this;
    }

    build(): RenderableApplication {
        return new RenderableApplication(this);
    }

}
