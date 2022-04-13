import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {IdProvider} from '../principal/IdProvider';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ViewItem} from 'lib-admin-ui/app/view/ViewItem';
import {Application} from '../application/Application';
import {Component} from '../schema/Component';

export enum UserTreeGridItemType {
    ID_PROVIDER,
    PRINCIPAL,
    GROUPS,
    USERS,
    ROLES,
    APPLICATION,
    PARTS,
    LAYOUTS,
    PAGES,
    COMPONENT
}

export class UserTreeGridItem
    implements ViewItem {

    private application: Application;

    private component: Component;

    private idProvider: IdProvider;

    private principal: Principal;

    private type: UserTreeGridItemType;

    private modifiedTime: Date;

    private children: boolean;

    constructor(builder: UserTreeGridItemBuilder) {
        this.idProvider = builder.idProvider;
        this.principal = builder.principal;
        this.application = builder.application;
        this.component = builder.component;
        this.type = builder.type;
        this.children = builder.children;

        if (this.type === UserTreeGridItemType.PRINCIPAL) {
            this.modifiedTime = this.principal.getModifiedTime();
        }
    }

    static fromIdProvider(idProvider: IdProvider): UserTreeGridItem {
        return new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();
    }

    setIdProvider(idProvider: IdProvider): void {
        this.idProvider = idProvider;
    }

    setPrincipal(principal: Principal): void {
        this.principal = principal;
    }

    setApplication(application: Application): void {
        this.application = application;
    }

    setComponent(component: Component): void {
        this.component = component;
    }

    setType(type: UserTreeGridItemType): void {
        this.type = type;
    }

    getType(): UserTreeGridItemType {
        return this.type;
    }

    getPrincipal(): Principal {
        return this.principal;
    }

    getItemDisplayName(): string {
        switch (this.type) {

        case UserTreeGridItemType.APPLICATION:
            return this.application.getDisplayName();

            case UserTreeGridItemType.COMPONENT:
            return this.component.getDisplayName();

        case UserTreeGridItemType.ID_PROVIDER:
            return this.idProvider.getDisplayName();

        case UserTreeGridItemType.PRINCIPAL:
            return this.principal.getDisplayName();

        case UserTreeGridItemType.ROLES:
            return i18n('field.roles');

        case UserTreeGridItemType.USERS:
            return i18n('field.users');

        case UserTreeGridItemType.GROUPS:
            return i18n('field.groups');

        case UserTreeGridItemType.PARTS:
            return i18n('field.parts');

        case UserTreeGridItemType.LAYOUTS:
            return i18n('field.layouts');

        case UserTreeGridItemType.PAGES:
            return i18n('field.pages');

        }
        return '';
    }

    getId(): string {
        switch (this.type) {
        case UserTreeGridItemType.APPLICATION:
            return this.application.getApplicationKey().toString();

            case UserTreeGridItemType.COMPONENT:
            return this.component.getKey();

        case UserTreeGridItemType.ID_PROVIDER:
            return this.idProvider.getKey().toString();

        case UserTreeGridItemType.PRINCIPAL:
            return this.principal.getKey().toString().toLowerCase();

        case UserTreeGridItemType.GROUPS:
            return this.idProvider.getKey().toString() + '/groups';

        case UserTreeGridItemType.ROLES:
            return '/roles';

        case UserTreeGridItemType.USERS:
            return this.idProvider.getKey().toString() + '/users';

        case UserTreeGridItemType.PARTS:
            return this.application.getApplicationKey().toString() + '/parts';

        case UserTreeGridItemType.LAYOUTS:
            return this.application.getApplicationKey().toString() + '/layouts';

        case UserTreeGridItemType.PAGES:
            return this.application.getApplicationKey().toString() + '/pages';
        default:
            return '';
        }

    }

    isApplication(): boolean {
        return this.type === UserTreeGridItemType.APPLICATION;
    }

    isComponent(): boolean {
        return this.type === UserTreeGridItemType.COMPONENT;
    }

    isUser(): boolean {
        return this.type === UserTreeGridItemType.USERS;
    }

    isUserGroup(): boolean {
        return this.type === UserTreeGridItemType.GROUPS;
    }

    isIdProvider(): boolean {
        return this.type === UserTreeGridItemType.ID_PROVIDER;
    }

    isRole(): boolean {
        return this.type === UserTreeGridItemType.ROLES;
    }

    isPrincipal(): boolean {
        return this.type === UserTreeGridItemType.PRINCIPAL;
    }

    hasChildren(): boolean {
        return this.isApplication() || this.isIdProvider() || this.isRole() || this.children;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, UserTreeGridItem)) {
            return false;
        }

        const other:UserTreeGridItem = <UserTreeGridItem> o;
        return this.type === other.getType() && this.principal === other.getPrincipal() && this.idProvider === other.getIdProvider() && this.application === other.getApplication()&& this.component === other.getComponent();
    }

    static create(): UserTreeGridItemBuilder {
        return new UserTreeGridItemBuilder();
    }

    getIdProvider(): IdProvider {
        return this.idProvider;
    }

    getApplication(): Application {
        return this.application;
    }

    getComponent(): Component {
        return this.component;
    }

    static fromPrincipal(principal: Principal): UserTreeGridItem {
        return new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build();
    }

    static getParentType(principal: Principal): UserTreeGridItemType {
        switch (principal.getType()) {
        case PrincipalType.GROUP:
            return UserTreeGridItemType.GROUPS;
        case PrincipalType.USER:
            return UserTreeGridItemType.USERS;
        case PrincipalType.ROLE:
            return UserTreeGridItemType.ROLES;
        default:
            return null;
        }
    }

    getDisplayName(): string {
        return this.getItemDisplayName();
    }

    getIconClass(): string {
        switch (this.getType()) {
        case UserTreeGridItemType.APPLICATION:
            return 'icon-folder icon-large';

            case UserTreeGridItemType.COMPONENT:
            return 'icon-part icon-large';

        case UserTreeGridItemType.ID_PROVIDER:
            return 'icon-address-book icon-large';

        case UserTreeGridItemType.PRINCIPAL:
            if (this.getPrincipal().isRole()) {
                return 'icon-masks icon-large';

            } else if (this.getPrincipal().isUser()) {
                return 'icon-user icon-large';

            } else if (this.getPrincipal().isGroup()) {
                return 'icon-users icon-large';
            }
            break;

        case UserTreeGridItemType.GROUPS:
            return 'icon-folder icon-large';

        case UserTreeGridItemType.ROLES:
            return 'icon-folder icon-large';

        case UserTreeGridItemType.USERS:
            return 'icon-folder icon-large';

        case UserTreeGridItemType.PARTS:
            return 'icon-folder icon-large';

        case UserTreeGridItemType.PAGES:
            return 'icon-folder icon-large';

        case UserTreeGridItemType.LAYOUTS:
            return 'icon-folder icon-large';
        }
    }

    getIconUrl(): string {
        return '';
    }

    getIconSrc():string {
        if( this.isApplication() ) {
            return this.application.getIcon();
        }

        return null;
    }
}

export class UserTreeGridItemBuilder {
    application: Application;
    component: Component;
    idProvider: IdProvider;
    principal: Principal;
    type: UserTreeGridItemType;
    children: boolean;

    setApplication(application: Application): UserTreeGridItemBuilder {
        this.application = application;
        return this;
    }

    setComponent(component: Component): UserTreeGridItemBuilder {
        this.component = component;
        return this;
    }

    setIdProvider(idProvider: IdProvider): UserTreeGridItemBuilder {
        this.idProvider = idProvider;
        return this;
    }

    setPrincipal(principal: Principal): UserTreeGridItemBuilder {
        this.principal = principal;
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
        if (userItem instanceof Application) {
            return this.setApplication(userItem).setType(UserTreeGridItemType.APPLICATION);
        }
        if (userItem instanceof Component) {
            return this.setComponent(userItem).setType(UserTreeGridItemType.COMPONENT);
        }
        else if (userItem instanceof Principal) {
            return this.setPrincipal(userItem).setType(UserTreeGridItemType.PRINCIPAL);
        } else if (userItem instanceof IdProvider) {
            return this.setIdProvider(userItem).setType(UserTreeGridItemType.ID_PROVIDER);
        }
        return this;
    }

    build(): UserTreeGridItem {
        return new UserTreeGridItem(this);
    }
}
