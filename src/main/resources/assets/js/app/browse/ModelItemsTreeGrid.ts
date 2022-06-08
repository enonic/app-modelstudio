import * as Q from 'q';
import {ModelTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './ModelTreeGridItem';
import {ModelTreeGridActions} from './ModelTreeGridActions';
import {ModelItemsRowFormatter} from './ModelItemsRowFormatter';
import {TreeGrid} from '@enonic/lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {TreeGridBuilder} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {TreeGridContextMenu} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {BrowseFilterResetEvent} from '@enonic/lib-admin-ui/app/browse/filter/BrowseFilterResetEvent';
import {ResponsiveRanges} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveRanges';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ListApplicationsRequest} from '../../graphql/application/ListApplicationsRequest';
import {Application} from '../application/Application';
import {ComponentType} from '../schema/ComponentType';
import {ListComponentsRequest} from '../../graphql/schema/ListComponentsRequest';
import {Component} from '../schema/Component';
import {SchemaType} from '../schema/SchemaType';
import {ListSchemasRequest} from '../../graphql/schema/ListSchemasRequest';
import {Schema} from '../schema/Schema';
import {GetSiteRequest} from '../../graphql/schema/GetSiteRequest';
import {Site} from '../schema/Site';
import {Styles} from '../schema/Styles';
import {GetStylesRequest} from '../../graphql/schema/GetStylesRequest';
import {RenderableApplication} from '../application/RenderableApplication';

export class ModelItemsTreeGrid
    extends TreeGrid<ModelTreeGridItem> {

    private treeGridActions: ModelTreeGridActions;

    constructor() {

        const builder = new TreeGridBuilder<ModelTreeGridItem>().setColumnConfig([{
            name: i18n('field.name'),
            id: 'name',
            field: 'displayName',
            formatter: ModelItemsRowFormatter.nameFormatter,
            style: {minWidth: 200}
        }]).setPartialLoadEnabled(true).setLoadBufferSize(20).prependClasses('model-tree-grid');

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

        this.treeGridActions = new ModelTreeGridActions(this);

        this.setContextMenu(new TreeGridContextMenu(this.treeGridActions));

        this.initEventHandlers();
    }

    private initEventHandlers() {
        BrowseFilterResetEvent.on(() => {
            this.resetFilter();
        });

        this.getGrid().subscribeOnDblClick((event, data) => {

            if (this.isActive()) {
                const node: TreeNode<ModelTreeGridItem> = this.getGrid().getDataView().getItem(data.row);
                this.editItem(node);
            }
        });
    }

    isEmptyNode(node: TreeNode<ModelTreeGridItem>): boolean {
        return !node.getDataId() || node.getDataId() === '';
    }

    getTreeGridActions(): ModelTreeGridActions {
        return this.treeGridActions;
    }

    protected hasChildren(data: ModelTreeGridItem): boolean {
        return data.hasChildren();
    }

    fetchChildren(parentNode?: TreeNode<ModelTreeGridItem>): Q.Promise<ModelTreeGridItem[]> {
        parentNode = parentNode || this.getRoot().getCurrentRoot();

        let level: number = parentNode ? parentNode.calcLevel() : 0;

        if (level === 0) {
            return this.isFiltered() ? this.fetchFilteredItems() : this.fetchApplications();
        }

        if (parentNode.getData().isApplication()) {
            return this.createApplicationFolders(parentNode);
        }

        if (level === 2) {
            return this.fetchComponents(parentNode);
        }
    }

    private fetchFilteredItems(): Q.Promise<ModelTreeGridItem[]> {
        return Q([]);
    }

    private fetchApplications(): Q.Promise<ModelTreeGridItem[]> {

        return new ListApplicationsRequest().sendAndParse().then((apps: Application[]) => {

            const sitePromises: Q.Promise<Site>[] = apps
                .map(app => app.getApplicationKey())
                .map(key => new GetSiteRequest().setApplicationKey(key)
                    .sendAndParse());


            return Q.all(sitePromises).then((sites: Site[]) => {
                const sitesToShow = sites.filter(key => key != null);

                const appsToShow: RenderableApplication[] = [];
                apps.forEach(app => {
                    sitesToShow.forEach(site => {
                        if (site.getKey().equals(app.getApplicationKey())) {
                            appsToShow.push(RenderableApplication.create().setApplication(app).setSite(site).build());
                        }
                    });
                });


                return appsToShow.map(application => new UserTreeGridItemBuilder().setApplication(application).setType(
                    UserTreeGridItemType.APPLICATION).setHasChildren(true).build());
            });
        });

    }

    private createApplicationFolders(parentNode: TreeNode<ModelTreeGridItem>): Q.Promise<ModelTreeGridItem[]> {
        const applicationNode: ModelTreeGridItem = parentNode.getData();
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

    private addFoldersToApplication(parentItem: ModelTreeGridItem): ModelTreeGridItem[]/*Q.Promise<UserTreeGridItem[]>*/ {
        const application: RenderableApplication = parentItem.getApplication();
        const partFolderItem: ModelTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.PARTS).setHasChildren(
               true).build();
        const layoutFolderItem: ModelTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.LAYOUTS).setHasChildren(
                true).build();
        const pageFolderItem: ModelTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.PAGES).setHasChildren(
                true).build();
        const contentTypesFolderItem: ModelTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.CONTENT_TYPES).setHasChildren(
                true).build();
        const mixinsFolderItem: ModelTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.MIXINS).setHasChildren(
                true).build();
        const xDataFolderItem: ModelTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.XDATAS).setHasChildren(
                true).build();
        return [partFolderItem, layoutFolderItem, pageFolderItem, contentTypesFolderItem, mixinsFolderItem, xDataFolderItem];
    }

    private fetchComponents(parentNode: TreeNode<ModelTreeGridItem>): Q.Promise<ModelTreeGridItem[]> {
        const folder: ModelTreeGridItem = parentNode.getData();
        const dynamicSchemaType = this.getDynamicSchemaTypeForFolderItem(folder.getType());

        return this.loadChildren(parentNode, dynamicSchemaType);
    }

    private loadChildren(parentNode: TreeNode<ModelTreeGridItem>, type: ComponentType | SchemaType): Q.Promise<ModelTreeGridItem[]> {
        this.removeEmptyNode(parentNode);

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
            const style: Q.Promise<Styles> = new GetStylesRequest().setApplicationKey(
                parentNode.getData().getApplication().getApplicationKey()).sendAndParse();

            return style.then((styles) => {
                const result = [];
                if (styles) {
                    const stylesItem: ModelTreeGridItem = new UserTreeGridItemBuilder().setStyles(styles).setType(
                        UserTreeGridItemType.STYLES).build();
                    result.push(stylesItem);
                }
                return result;
            });
        }

    }

    private removeEmptyNode(parentNode: TreeNode<ModelTreeGridItem>) {
        parentNode.getChildren().some((child: TreeNode<ModelTreeGridItem>, index: number) => {
            if (!child.getData().getId()) {
                parentNode.getChildren().splice(index, 1);
                return true;
            }

            return false;
        });
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
}
