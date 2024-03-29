import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ViewItem} from '@enonic/lib-admin-ui/app/view/ViewItem';
import {Component} from '../schema/Component';
import {ComponentType} from '../schema/ComponentType';
import {Schema} from '../schema/Schema';
import {SchemaType} from '../schema/SchemaType';
import {Site} from '../schema/Site';
import {Styles} from '../schema/Styles';
import {RenderableApplication} from '../application/RenderableApplication';
import {UrlHelper} from '../util/UrlHelper';

export enum UserTreeGridItemType {
    APPLICATION,
    PARTS,
    LAYOUTS,
    PAGES,
    CONTENT_TYPES,
    MIXINS,
    XDATAS,
    PART,
    LAYOUT,
    PAGE,
    CONTENT_TYPE,
    MIXIN,
    XDATA,
    SITE,
    STYLES
}

export class ModelTreeGridItem
    implements ViewItem {

    private application: RenderableApplication;

    private component: Component;

    private schema: Schema;

    private site: Site;

    private styles: Styles;

    private type: UserTreeGridItemType;

    private children: boolean;

    constructor(builder: UserTreeGridItemBuilder) {
        this.application = builder.application;
        this.component = builder.component;
        this.schema = builder.schema;
        this.site = builder.site;
        this.styles = builder.styles;
        this.type = builder.type;
        this.children = builder.children;
    }

    setApplication(application: RenderableApplication): void {
        this.application = application;
    }

    setComponent(component: Component): void {
        this.component = component;
    }

    setSchema(schema: Schema): void {
        this.schema = schema;
    }

    setSite(site: Site): void {
        this.site = site;
    }

    setStyles(styles: Styles): void {
        this.styles = styles;
    }

    setType(type: UserTreeGridItemType): void {
        this.type = type;
    }

    getType(): UserTreeGridItemType {
        return this.type;
    }

    getItemDisplayName(): string {
        switch (this.type) {

        case UserTreeGridItemType.APPLICATION:
            return this.application.getDisplayName();

        case UserTreeGridItemType.PART:
        case UserTreeGridItemType.LAYOUT:
        case UserTreeGridItemType.PAGE:
            return this.component.getDisplayName();

        case UserTreeGridItemType.CONTENT_TYPE:
        case UserTreeGridItemType.MIXIN:
        case UserTreeGridItemType.XDATA:
            return this.schema.getDisplayName();

        case UserTreeGridItemType.SITE:
            return 'site.xml';

        case UserTreeGridItemType.STYLES:
            return 'styles'; //'styles.xml';

        case UserTreeGridItemType.PARTS:
            return i18n('field.parts');

        case UserTreeGridItemType.LAYOUTS:
            return i18n('field.layouts');

        case UserTreeGridItemType.PAGES:
            return i18n('field.pages');

        case UserTreeGridItemType.CONTENT_TYPES:
            return i18n('field.contentTypes');

        case UserTreeGridItemType.MIXINS:
            return i18n('field.mixins');

        case UserTreeGridItemType.XDATAS:
            return i18n('field.xdatas');

        }
        return '';
    }

    getId(): string {
        switch (this.type) {
        case UserTreeGridItemType.APPLICATION:
            return this.application.getApplicationKey().toString();
        case UserTreeGridItemType.PART:
            return 'parts/' + this.component.getName().toString();
        case UserTreeGridItemType.LAYOUT:
            return 'layouts/' + this.component.getName().toString();
        case UserTreeGridItemType.PAGE:
            return 'pages/' + this.component.getName().toString();
        case UserTreeGridItemType.CONTENT_TYPE:
            return 'content-types/' + this.schema.getName().toString();
        case UserTreeGridItemType.MIXIN:
            return 'mixins/' + this.schema.getName().toString();
        case UserTreeGridItemType.XDATA:
            return 'x-data/' + this.schema.getName().toString();
        case UserTreeGridItemType.SITE:
            return this.site.getKey().toString() + '/site.xml';
        case UserTreeGridItemType.STYLES:
            return this.styles.getKey().toString() + '/styles.xml';
        case UserTreeGridItemType.PARTS:
            return this.application.getApplicationKey().toString() + '/parts';
        case UserTreeGridItemType.LAYOUTS:
            return this.application.getApplicationKey().toString() + '/layouts';
        case UserTreeGridItemType.PAGES:
            return this.application.getApplicationKey().toString() + '/pages';
        case UserTreeGridItemType.CONTENT_TYPES:
            return this.application.getApplicationKey().toString() + '/content-types';
        case UserTreeGridItemType.MIXINS:
            return this.application.getApplicationKey().toString() + '/mixins';
        case UserTreeGridItemType.XDATAS:
            return this.application.getApplicationKey().toString() + '/x-data';
        default:
            return '';
        }
    }

    isApplication(): boolean {
        return this.type === UserTreeGridItemType.APPLICATION;
    }

    isPart(): boolean {
        return this.type === UserTreeGridItemType.PART;
    }

    isParts(): boolean {
        return this.type === UserTreeGridItemType.PARTS;
    }

    isLayout(): boolean {
        return this.type === UserTreeGridItemType.LAYOUT;
    }

    isLayouts(): boolean {
        return this.type === UserTreeGridItemType.LAYOUTS;
    }

    isPage(): boolean {
        return this.type === UserTreeGridItemType.PAGE;
    }

    isPages(): boolean {
        return this.type === UserTreeGridItemType.PAGES;
    }

    isContentType(): boolean {
        return this.type === UserTreeGridItemType.CONTENT_TYPE;
    }

    isContentTypes(): boolean {
        return this.type === UserTreeGridItemType.CONTENT_TYPES;
    }

    isMixin(): boolean {
        return this.type === UserTreeGridItemType.MIXIN;
    }

    isMixins(): boolean {
        return this.type === UserTreeGridItemType.MIXINS;
    }

    isXData(): boolean {
        return this.type === UserTreeGridItemType.XDATA;
    }

    isXDatas(): boolean {
        return this.type === UserTreeGridItemType.XDATAS;
    }

    isSite(): boolean {
        return this.type === UserTreeGridItemType.SITE;
    }

    isSchema(): boolean {
        return this.type === UserTreeGridItemType.CONTENT_TYPE || this.type === UserTreeGridItemType.MIXIN || this.type ===
               UserTreeGridItemType.XDATA;
    }

    isSchemaFolder(): boolean {
        return this.type === UserTreeGridItemType.CONTENT_TYPES || this.type === UserTreeGridItemType.MIXINS || this.type ===
            UserTreeGridItemType.XDATAS;
    }

    isComponent(): boolean {
        return this.type === UserTreeGridItemType.PART || this.type === UserTreeGridItemType.LAYOUT || this.type ===
               UserTreeGridItemType.PAGE;
    }

    isComponentFolder(): boolean {
        return this.type === UserTreeGridItemType.PARTS || this.type === UserTreeGridItemType.LAYOUTS || this.type ===
            UserTreeGridItemType.PAGES;
    }

    isStyles(): boolean {
        return this.type === UserTreeGridItemType.STYLES;
    }

    hasChildren(): boolean {
        return this.isApplication() || this.children;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, ModelTreeGridItem)) {
            return false;
        }

        const other: ModelTreeGridItem = <ModelTreeGridItem>o;
        return this.type === other.getType() &&
               this.application === other.getApplication() && this.component === other.getComponent() && this.schema ===
               other.getSchema() && this.site === other.getSite() && this.styles === other.getStyles();
    }

    static create(): UserTreeGridItemBuilder {
        return new UserTreeGridItemBuilder();
    }

    getApplication(): RenderableApplication {
        return this.application;
    }

    getComponent(): Component {
        return this.component;
    }

    getSchema(): Schema {
        return this.schema;
    }

    getSite(): Site {
        return this.site;
    }

    getStyles(): Styles {
        return this.styles;
    }

    getDisplayName(): string {
        return this.getItemDisplayName();
    }

    getIconClass(): string {
        return '';
    }

    getIconUrl(): string {
        if (this.isApplication()) {
            return UrlHelper.getCmsRestUri('apps/application/icon/') + this.getId();
        }
        if (this.isContentType()) {
            return UrlHelper.getCmsRestUri('cs/schema/content/icon/') + this.schema.getName().toString();
        }
        if (this.isPart()) {
            return UrlHelper.getCmsRestUri('cs/content/page/part/descriptor/icon/') + this.component.getName().toString();
        }
        if (this.isLayout()) {
            return UrlHelper.getCmsRestUri('cs/schema/content/icon/portal:page-template');
        }
        if (this.isPage() || this.isMixin() || this.isXData() || this.isSite() || this.isStyles()) {
            return UrlHelper.getCmsRestUri('cs/schema/content/icon/media:document');
        }
        
        return UrlHelper.getCmsRestUri('cs/schema/content/icon/base:folder');
    }
}

export class UserTreeGridItemBuilder {
    application: RenderableApplication;
    component: Component;
    schema: Schema;
    site: Site;
    styles: Styles;
    principal: Principal;
    type: UserTreeGridItemType;
    children: boolean;

    setApplication(application: RenderableApplication): UserTreeGridItemBuilder {
        this.application = application;
        return this;
    }

    setComponent(component: Component): UserTreeGridItemBuilder {
        this.component = component;
        return this;
    }

    setSchema(schema: Schema): UserTreeGridItemBuilder {
        this.schema = schema;
        return this;
    }

    setSite(site: Site): UserTreeGridItemBuilder {
        this.site = site;
        return this;
    }

    setStyles(styles: Styles): UserTreeGridItemBuilder {
        this.styles = styles;
        return this;
    }

    setType(type: UserTreeGridItemType): UserTreeGridItemBuilder {
        this.type = type;
        return this;
    }

    setHasChildren(value: boolean): UserTreeGridItemBuilder {
        this.children = value;
        return this;
    }

    setAny(userItem: UserItem): UserTreeGridItemBuilder {
        if (userItem instanceof RenderableApplication) {
            return this.setApplication(userItem).setType(UserTreeGridItemType.APPLICATION);
        }
        if (userItem instanceof Component) {
            if (ComponentType.PART == (<Component>userItem).getType()) {
                return this.setComponent(userItem).setType(UserTreeGridItemType.PART);
            }
            if (ComponentType.LAYOUT == (<Component>userItem).getType()) {
                return this.setComponent(userItem).setType(UserTreeGridItemType.LAYOUT);
            }
            if (ComponentType.PAGE == (<Component>userItem).getType()) {
                return this.setComponent(userItem).setType(UserTreeGridItemType.PAGE);
            }
        } else if (userItem instanceof Schema) {
            if (SchemaType.CONTENT_TYPE == (<Schema>userItem).getType()) {
                return this.setSchema(userItem).setType(UserTreeGridItemType.CONTENT_TYPE);
            }
            if (SchemaType.MIXIN == (<Schema>userItem).getType()) {
                return this.setSchema(userItem).setType(UserTreeGridItemType.MIXIN);
            }
            if (SchemaType.XDATA == (<Schema>userItem).getType()) {
                return this.setSchema(userItem).setType(UserTreeGridItemType.XDATA);
            }
        } else if (userItem instanceof Site) {
            return this.setSite(userItem).setType(UserTreeGridItemType.SITE);
        } else if (userItem instanceof Styles) {
            return this.setStyles(userItem).setType(UserTreeGridItemType.STYLES);
        }
        return this;
    }

    build(): ModelTreeGridItem {
        return new ModelTreeGridItem(this);
    }
}
