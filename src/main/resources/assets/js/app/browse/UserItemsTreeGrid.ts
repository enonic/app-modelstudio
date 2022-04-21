import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './UserTreeGridItem';
import {UserTreeGridActions} from './UserTreeGridActions';
import {EditPrincipalEvent} from './EditPrincipalEvent';
import {UserItemsRowFormatter} from './UserItemsRowFormatter';
import {PrincipalBrowseSearchData} from './filter/PrincipalBrowseSearchData';
import {UserItemType} from './UserItemType';
import {ListUserItemsRequest} from '../../graphql/principal/ListUserItemsRequest';
import {IdProvider} from '../principal/IdProvider';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {TreeGridContextMenu} from 'lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {BrowseFilterResetEvent} from 'lib-admin-ui/app/browse/filter/BrowseFilterResetEvent';
import {BrowseFilterSearchEvent} from 'lib-admin-ui/app/browse/filter/BrowseFilterSearchEvent';
import {ResponsiveRanges} from 'lib-admin-ui/ui/responsive/ResponsiveRanges';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {Body} from 'lib-admin-ui/dom/Body';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ListPrincipalsKeysResult, ListPrincipalsNamesRequest} from '../../graphql/principal/ListPrincipalsNamesRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {GetPrincipalsTotalRequest} from '../../graphql/principal/GetPrincipalsTotalRequest';
import {ListApplicationsRequest} from '../../graphql/apps/ListApplicationsRequest';
import {Application} from '../application/Application';
import {ComponentType} from '../schema/ComponentType';
import {ListComponentsRequest} from '../../graphql/apps/ListComponentsRequest';
import {Component} from '../schema/Component';
import {SchemaType} from '../schema/SchemaType';
import {ListSchemasRequest} from '../../graphql/apps/ListSchemasRequest';
import {Schema} from '../schema/Schema';
import {GetSiteRequest} from '../../graphql/apps/GetSiteRequest';
import {Site} from '../schema/Site';
import {Styles} from '../schema/Styles';
import {GetStylesRequest} from '../../graphql/apps/GetStylesRequest';

export class UserItemsTreeGrid
    extends TreeGrid<UserTreeGridItem> {

    private treeGridActions: UserTreeGridActions;
    private searchString: string;
    private searchTypes: UserItemType[];

    constructor() {

        const builder = new TreeGridBuilder<UserTreeGridItem>().setColumnConfig([{
            name: i18n('field.name'),
            id: 'name',
            field: 'displayName',
            formatter: UserItemsRowFormatter.nameFormatter,
            style: {minWidth: 200}
        }]).setPartialLoadEnabled(true).setLoadBufferSize(20).prependClasses('user-tree-grid');

        const columns = builder.getColumns().slice(0);
        const [nameColumn] = columns;

        const updateColumns = () => {
            let checkSelIsMoved = ResponsiveRanges._540_720.isFitOrSmaller(Body.get().getEl().getWidth());

            const curClass = nameColumn.getCssClass();

            if (checkSelIsMoved) {
                nameColumn.setCssClass(curClass || 'shifted');
            } else if (curClass && curClass.indexOf('shifted') >= 0) {
                nameColumn.setCssClass(curClass.replace('shifted', ''));
            }

            this.setColumns(columns.slice(0), checkSelIsMoved);
        };

        builder.setColumnUpdater(updateColumns);

        super(builder);

        this.treeGridActions = new UserTreeGridActions(this);

        this.setContextMenu(new TreeGridContextMenu(this.treeGridActions));

        this.initEventHandlers();
    }

    protected isSelectableNode(node: TreeNode<UserTreeGridItem>): boolean {
        return this.isUserItemEditable(node.getData());
    }

    private initEventHandlers() {
        BrowseFilterSearchEvent.on((event: BrowseFilterSearchEvent<PrincipalBrowseSearchData>) => {
            const data = event.getData();
            const items = data.getUserItems().map((userItem: UserItem) => {
                return new UserTreeGridItemBuilder().setAny(userItem).build();
            });
            this.searchString = data.getSearchString();
            this.searchTypes = data.getTypes();
            this.filter(items);
            this.notifyLoaded();
        });

        BrowseFilterResetEvent.on(() => {
            this.resetFilter();
        });

        this.getGrid().subscribeOnDblClick((event, data) => {

            if (this.isActive()) {
                const node: TreeNode<UserTreeGridItem> = this.getGrid().getDataView().getItem(data.row);
                this.editItem(node);
            }
        });
    }

    protected editItem(node: TreeNode<UserTreeGridItem>): void {
        if (this.isUserItemEditable(node.getData())) {
            new EditPrincipalEvent([node.getData()]).fire();
        }
    }

    private isUserItemEditable(userItem: UserTreeGridItem): boolean {
        return !(userItem.isRole() || userItem.isUserGroup() || userItem.isUser());
    }

    isEmptyNode(node: TreeNode<UserTreeGridItem>): boolean {
        return !node.getDataId() || node.getDataId() === '';
    }

    getTreeGridActions(): UserTreeGridActions {
        return this.treeGridActions;
    }

    updateUserNode(principal: Principal, idProvider: IdProvider): void {
        if (!principal && !idProvider) {
            return;
        }

        let userTreeGridItem: UserTreeGridItem;
        const builder: UserTreeGridItemBuilder = new UserTreeGridItemBuilder();

        if (!principal) { // IdProvider type
            userTreeGridItem = builder.setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();
        } else {         // Principal type
            userTreeGridItem = builder.setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build();
        }

        const nodeList: TreeNode<UserTreeGridItem>[] = this.getRoot().getCurrentRoot().treeToList();

        nodeList.forEach((node) => {
            if (node.getDataId() === userTreeGridItem.getId()) {
                node.setData(userTreeGridItem);
                node.clearViewers();
            }
        });

        this.initData(nodeList);
        this.invalidate();
    }

    appendUserItemNode(principal: Principal, idProvider: IdProvider): void {
        if (!principal) {
            this.appendIdProviderNode(idProvider);
        } else {
            this.appendPrincipalNode(principal, idProvider);
        }
    }

    private appendIdProviderNode(idProvider: IdProvider) {
        const userTreeGridItem = new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(
            UserTreeGridItemType.ID_PROVIDER).build();

        this.insertDataToParentNode(userTreeGridItem, this.getRoot().getDefaultRoot(), this.getIdProviderInsertIndex(idProvider));
    }

    private getIdProviderInsertIndex(idProvider: IdProvider): number {
        const idProvidersNames: string[] =
            this.getRoot().getDefaultRoot().getChildren().slice(1).map(
                (node: TreeNode<UserTreeGridItem>) => node.getData().getItemDisplayName());

        return this.doGetPrincipalIndex(idProvidersNames, idProvider.getDisplayName()) + 1;
    }

    private appendPrincipalNode(principal: Principal, idProvider: IdProvider) {
        const parentNode: TreeNode<UserTreeGridItem> = this.getRoot().getNodeByDataId(this.getPrincipalParentDataId(principal, idProvider));

        if (parentNode) {
            if (parentNode.isExpandable() && !parentNode.hasChildren()) {
                return;
            }

            const userTreeGridItem: UserTreeGridItem = new UserTreeGridItemBuilder().setPrincipal(principal).setType(
                UserTreeGridItemType.PRINCIPAL).build();
            this.getPrincipalIndex(parentNode, userTreeGridItem).then((insertIndex: number) => {
                this.insertDataToParentNode(userTreeGridItem, parentNode, insertIndex);
            }).catch(DefaultErrorHandler.handle);
        }
    }

    private getPrincipalIndex(parentNode: TreeNode<UserTreeGridItem>, userTreeGridItem: UserTreeGridItem): Q.Promise<number> {
        return new ListPrincipalsNamesRequest()
            .setIdProviderKey(this.getIdProviderKey(parentNode))
            .setTypes([this.getPrincipalTypeForFolderItem(parentNode.getData().getType())])
            .setSort('displayName ASC')
            .sendAndParse()
            .then((result: ListPrincipalsKeysResult) => {
                return this.doGetPrincipalIndex(result.displayNames, userTreeGridItem.getItemDisplayName());
            });
    }

    private doGetPrincipalIndex(displayNames: string[], item: string): number {
        let insertIndex: number = 0;

        displayNames.some((dn: string, index: number) => {
            insertIndex = index;
            return dn.localeCompare(item) >= 0;
        });

        return insertIndex;
    }

    private getPrincipalParentDataId(principal: Principal, idProvider: IdProvider): string {
        if (principal.getType() === PrincipalType.USER) {
            return idProvider.getKey().toString() + '/users';
        }

        if (principal.getType() === PrincipalType.GROUP) {
            return idProvider.getKey().toString() + '/groups';
        }

        return '/roles';
    }

    fetchChildren(parentNode?: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        parentNode = parentNode || this.getRoot().getCurrentRoot();

        // this.listApplications();

        let level: number = parentNode ? parentNode.calcLevel() : 0;

        // Creating a role with parent node pointing to another role may cause fetching to fail
        // We need to select a parent node first
        if (level !== 0 && parentNode.getData().getPrincipal() &&
            parentNode.getData().isPrincipal() &&
            parentNode.getData().getPrincipal().isRole() && !!parentNode.getParent()) {

            parentNode = parentNode.getParent();
            level--;
        }

        if (level === 0) {
            return this.isFiltered() ? this.fetchFilteredItems() : this.fetchApplications();
        }

        // if (parentNode.getData().isRole()) {
        //     return this.fetchRoles(parentNode);
        // }

        if (parentNode.getData().isApplication()) {
            return this.createApplicationFolders(parentNode);
        }

        if (level === 1) {
            return this.createUsersAndGroupsFolders(parentNode);
        }

        if (level === 2) {
            return this.fetchComponents(parentNode);
        }
    }

    private fetchFilteredItems(): Q.Promise<UserTreeGridItem[]> {
        return new ListUserItemsRequest().setTypes(this.searchTypes).setQuery(this.searchString).sendAndParse()
            .then((result) => {
                return result.userItems.map(item => new UserTreeGridItemBuilder().setAny(item).build());
            });
    }

    private fetchApplications(): Q.Promise<UserTreeGridItem[]> {

        return new ListApplicationsRequest().sendAndParse().then((result: Application[]) => {
            return result.map(application => {
                return new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.APPLICATION).build();
            });
        });

        // return new ListIdProvidersRequest()
        //     .setSort('displayName ASC')
        //     .sendAndParse()
        //     .then((idProviders: IdProvider[]) => {
        //         const gridItems: UserTreeGridItem[] = [];
        //         gridItems.push(new UserTreeGridItemBuilder().setType(UserTreeGridItemType.ROLES).build());
        //         idProviders.forEach((idProvider: IdProvider) => {
        //             gridItems.push(
        //                 new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build());
        //         });
        //
        //         return gridItems;
        //     });
    }

    // private fetchRoles(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
    //     return this.loadChildren(parentNode, [PrincipalType.ROLE]);
    // }

    private createApplicationFolders(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        const applicationNode: UserTreeGridItem = parentNode.getData();
        if (applicationNode.isApplication()) {
            let folders = this.addFoldersToApplication(applicationNode);
            return this.loadChildren(parentNode, null).then(children => {
                let result = [];
                if (folders && folders.length > 0) {
                    result = result.concat(folders);
                }
                if (children && children.length > 0) {
                    result = result.concat(children);
                }
                return result;
            });
        }

        return Q([]);
    }

    private createUsersAndGroupsFolders(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        const idProviderNode: UserTreeGridItem = parentNode.getData();
        if (idProviderNode.isIdProvider()) {
            return Q(this.addUsersGroupsToIdProvider(idProviderNode));
        }

        return Q([]);
    }

    private addFoldersToApplication(parentItem: UserTreeGridItem): UserTreeGridItem[]/*Q.Promise<UserTreeGridItem[]>*/ {
        const application: Application = parentItem.getApplication();
        // const promises: Q.Promise<number>[] = [];

        // promises.push(this.getTotalPrincipals(idProvider.getKey(), PrincipalType.USER));
        // promises.push(this.getTotalPrincipals(idProvider.getKey(), PrincipalType.GROUP));

        // return Q.all(promises).spread((totalUsers: number, totalGroups: number) => {
        const partFolderItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.PARTS).setHasChildren(
                /*totalUsers > 0*/true).build();
        const layoutFolderItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.LAYOUTS).setHasChildren(
                /*totalGroups > 0*/true).build();
        const pageFolderItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.PAGES).setHasChildren(
                /*totalGroups > 0*/true).build();
        const contentTypesFolderItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.CONTENT_TYPES).setHasChildren(
                /*totalGroups > 0*/true).build();
        const mixinsFolderItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.MIXINS).setHasChildren(
                /*totalGroups > 0*/true).build();
        const xDataFolderItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.XDATAS).setHasChildren(
                /*totalGroups > 0*/true).build();
        return [partFolderItem, layoutFolderItem, pageFolderItem, contentTypesFolderItem, mixinsFolderItem, xDataFolderItem];
        // });
    }

    private addUsersGroupsToIdProvider(parentItem: UserTreeGridItem): Q.Promise<UserTreeGridItem[]> {
        const idProvider: IdProvider = parentItem.getIdProvider();
        const promises: Q.Promise<number>[] = [];

        promises.push(this.getTotalPrincipals(idProvider.getKey(), PrincipalType.USER));
        promises.push(this.getTotalPrincipals(idProvider.getKey(), PrincipalType.GROUP));

        return Q.all(promises).spread((totalUsers: number, totalGroups: number) => {
            const userFolderItem: UserTreeGridItem =
                new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.USERS).setHasChildren(
                    totalUsers > 0).build();
            const groupFolderItem: UserTreeGridItem =
                new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.GROUPS).setHasChildren(
                    totalGroups > 0).build();
            return [userFolderItem, groupFolderItem];
        });
    }

    private getTotalPrincipals(idProviderKey: IdProviderKey, type: PrincipalType): Q.Promise<number> {
        return new GetPrincipalsTotalRequest().setIdProviderKey(idProviderKey).setTypes([type]).sendAndParse();
    }

    private fetchComponents(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        const folder: UserTreeGridItem = parentNode.getData();
        const dynamicSchemaType = this.getDynamicSchemaTypeForFolderItem(folder.getType());

        return this.loadChildren(parentNode, dynamicSchemaType);
    }


    // private fetchPrincipals(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
    //     const folder: UserTreeGridItem = parentNode.getData();
    //     const principalType: PrincipalType = this.getPrincipalTypeForFolderItem(folder.getType());
    //
    //     return this.loadChildren(parentNode, [principalType]);
    // }

    hasChildren(item: UserTreeGridItem): boolean {
        return item.hasChildren();
    }

    private loadChildren(parentNode: TreeNode<UserTreeGridItem>, type: ComponentType | SchemaType): Q.Promise<UserTreeGridItem[]> {
        this.removeEmptyNode(parentNode);
        // const from: number = parentNode.getChildren().length;
        // const gridItems: UserTreeGridItem[] = parentNode.getChildren().map((el) => el.getData()).slice(0, from);

        if (parentNode.getData().isPages() || parentNode.getData().isParts() || parentNode.getData().isLayouts()) {
            return new ListComponentsRequest()
                .setApplicationKey(parentNode.getData().getApplication().getApplicationKey())
                .setType(<ComponentType>type)
                .sendAndParse()
                .then((result: Component[]) => {
                    const gridItems = [];
                    result.forEach((component: Component) => {
                        const builder = new UserTreeGridItemBuilder().setComponent(component);

                        if (ComponentType.PART == component.getType()) {
                            builder.setType(UserTreeGridItemType.PART);
                        }

                        if (ComponentType.LAYOUT == component.getType()) {
                            builder.setType(UserTreeGridItemType.LAYOUT);
                        }

                        if (ComponentType.PAGE == component.getType()) {
                            builder.setType(UserTreeGridItemType.PAGE);
                        }

                        gridItems.push(builder.build());

                    });

                    return gridItems;
                });
        }

        if (parentNode.getData().isContentTypes() || parentNode.getData().isMixins() || parentNode.getData().isXDatas()) {
            return new ListSchemasRequest()
                .setApplicationKey(parentNode.getData().getApplication().getApplicationKey())
                .setType(<SchemaType>type)
                .sendAndParse()
                .then((result: Schema[]) => {
                    const gridItems = [];
                    result.forEach((schema: Schema) => {
                        const builder = new UserTreeGridItemBuilder().setSchema(schema);

                        if (SchemaType.CONTENT_TYPE == schema.getType()) {
                            builder.setType(UserTreeGridItemType.CONTENT_TYPE);
                        }

                        if (SchemaType.MIXIN == schema.getType()) {
                            builder.setType(UserTreeGridItemType.MIXIN);
                        }

                        if (SchemaType.XDATA == schema.getType()) {
                            builder.setType(UserTreeGridItemType.XDATA);
                        }

                        gridItems.push(builder.build());

                    });

                    return gridItems;
                });
        }

        if (parentNode.getData().isApplication()) {
            const promises: Q.Promise<Site | Styles>[] = [];

            promises.push(new GetSiteRequest().setApplicationKey(
                parentNode.getData().getApplication().getApplicationKey()).sendAndParse());
            promises.push(new GetStylesRequest().setApplicationKey(
                parentNode.getData().getApplication().getApplicationKey()).sendAndParse());

            return Q.all(promises).spread((site, styles) => {
                const result = [];
                if (site) {
                    const siteItem: UserTreeGridItem = new UserTreeGridItemBuilder().setSite(site).setType(
                        UserTreeGridItemType.SITE).build();
                    result.push(siteItem);
                }
                if (styles) {
                    const stylesItem: UserTreeGridItem = new UserTreeGridItemBuilder().setStyles(styles).setType(
                        UserTreeGridItemType.STYLES).build();
                    result.push(stylesItem);
                }
                return result;
            });
        }

    }

    // private loadChildren(parentNode: TreeNode<UserTreeGridItem>, allowedTypes: PrincipalType[]): Q.Promise<UserTreeGridItem[]> {
    //     this.removeEmptyNode(parentNode);
    //     const from: number = parentNode.getChildren().length;
    //     const gridItems: UserTreeGridItem[] = parentNode.getChildren().map((el) => el.getData()).slice(0, from);
    //
    //     return new ListPrincipalsRequest()
    //         .setIdProviderKey(this.getIdProviderKey(parentNode))
    //         .setTypes(allowedTypes)
    //         .setSort('displayName ASC')
    //         .setStart(from)
    //         .setCount(10)
    //         .sendAndParse()
    //         .then((result: ListPrincipalsData) => {
    //             const principals: Principal[] = result.principals;
    //
    //             principals.forEach((principal: Principal) => {
    //                 gridItems.push(
    //                     new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build());
    //             });
    //
    //             if (from + principals.length < result.total) {
    //                 gridItems.push(UserTreeGridItem.create().build());
    //             }
    //
    //             return gridItems;
    //         });
    // }

    private removeEmptyNode(parentNode: TreeNode<UserTreeGridItem>) {
        parentNode.getChildren().some((child: TreeNode<UserTreeGridItem>, index: number) => {
            if (!child.getData().getId()) {
                parentNode.getChildren().splice(index, 1);
                return true;
            }

            return false;
        });
    }

    // private getApplicationKey(parentNode: TreeNode<UserTreeGridItem>): ApplicationKey {
    //     // if (!parentNode.getData().isRole()) {
    //     //     const idProviderNode: UserTreeGridItem = parentNode.getParent().getData();
    //     //     return idProviderNode.A().getKey();
    //     // }
    //
    //     return parentNode.getData().getApplication();
    // }

    private getIdProviderKey(parentNode: TreeNode<UserTreeGridItem>): IdProviderKey {
        // fetch principals from the id provider, if parent node 'Groups' or 'Users' was selected
        if (!parentNode.getData().isRole()) {
            const idProviderNode: UserTreeGridItem = parentNode.getParent().getData();
            return idProviderNode.getIdProvider().getKey();
        }

        return null;
    }

    private getPrincipalTypeForFolderItem(itemType: UserTreeGridItemType): PrincipalType {
        if (itemType === UserTreeGridItemType.GROUPS) {
            return PrincipalType.GROUP;
        }

        if (itemType === UserTreeGridItemType.USERS) {
            return PrincipalType.USER;
        }

        if (itemType === UserTreeGridItemType.ROLES) {
            return PrincipalType.ROLE;
        }

        throw new Error('Invalid item type for folder with principals: ' + UserTreeGridItemType[itemType]);
    }

    private getDynamicSchemaTypeForFolderItem(itemType: UserTreeGridItemType): ComponentType | SchemaType {
        if (itemType === UserTreeGridItemType.PARTS) {
            return ComponentType.PART;
        }

        if (itemType === UserTreeGridItemType.LAYOUTS) {
            return ComponentType.LAYOUT;
        }

        if (itemType === UserTreeGridItemType.PAGES) {
            return ComponentType.PAGE;
        }

        if (itemType === UserTreeGridItemType.CONTENT_TYPES) {
            return SchemaType.CONTENT_TYPE;
        }

        if (itemType === UserTreeGridItemType.MIXINS) {
            return SchemaType.MIXIN;
        }

        if (itemType === UserTreeGridItemType.XDATAS) {
            return SchemaType.XDATA;
        }

        throw new Error('Invalid dynamic schema type for folder with components: ' + UserTreeGridItemType[itemType]);
    }

    private isSingleItemSelected(): boolean {
        return this.getSelectedDataList().length === 1;
    }

    private isHighlightedItemIn(userTreeGridItems: UserTreeGridItem[]): boolean {
        return userTreeGridItems.some((userTreeGridItem: UserTreeGridItem) => {
            return userTreeGridItem.getId() === this.getFirstSelectedOrHighlightedItem().getId();
        });
    }

}
