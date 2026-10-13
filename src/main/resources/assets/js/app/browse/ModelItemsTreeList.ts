import Q from 'q';
import {TreeListBox, TreeListBoxParams, TreeListElement, TreeListElementParams} from '@enonic/lib-admin-ui/ui/selector/list/TreeListBox';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ModelTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './ModelTreeGridItem';
import {ModelTreeGridItemViewer} from './ModelTreeGridItemViewer';
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

export class ModelItemsTreeList
    extends TreeListBox<ModelTreeGridItem> {

    private loadPromise: Q.Promise<void>;

    constructor(params?: TreeListBoxParams<ModelTreeGridItem>) {
        super(params);
    }

    protected createItemView(item: ModelTreeGridItem, readOnly: boolean): ModelItemsTreeListElement {
        return new ModelItemsTreeListElement(item, {scrollParent: this.scrollParent, parentList: this});
    }

    protected getItemId(item: ModelTreeGridItem): string {
        return item.getId();
    }

    protected handleLazyLoad(): void {
        if (this.getItemCount() === 0) {
            this.doLoad();
        }
    }

    load(): void {
        this.clearItems();
        this.doLoad();
    }

    whenLoaded(): Q.Promise<void> {
        return this.loadPromise ?? Q();
    }

    expandItem(id: string): Q.Promise<void> {
        const element: ModelItemsTreeListElement = this.findListElement(id);

        if (!element) {
            return Q();
        }

        element.expand();

        return element.getChildrenList().whenLoaded();
    }

    collapseItem(id: string): void {
        this.findListElement(id)?.collapse();
    }

    scrollToItem(id: string): void {
        this.findListElement(id)?.getDataView().getHTMLElement().scrollIntoView({block: 'nearest'});
    }

    private findListElement(id: string): ModelItemsTreeListElement {
        const item: ModelTreeGridItem = this.getItem(id);

        return item ? this.getItemView(item) as ModelItemsTreeListElement : null;
    }

    private doLoad(): void {
        this.loadPromise = this.fetchItems().then((items: ModelTreeGridItem[]) => {
            if (items.length > 0) {
                this.addItems(items);
            }
        }).catch(DefaultErrorHandler.handle);
    }

    private fetchItems(): Q.Promise<ModelTreeGridItem[]> {
        const parentItem: ModelTreeGridItem = this.getParentItem();

        if (!parentItem) {
            return this.fetchApplications();
        }

        if (parentItem.isApplication()) {
            return this.createApplicationFolders(parentItem);
        }

        if (parentItem.isComponentFolder() || parentItem.isSchemaFolder()) {
            return this.fetchComponents(parentItem);
        }

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

    private createApplicationFolders(applicationItem: ModelTreeGridItem): Q.Promise<ModelTreeGridItem[]> {
        let folders = this.addFoldersToApplication(applicationItem);
        return this.loadChildren(applicationItem, null).then(children => {
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

    private addFoldersToApplication(parentItem: ModelTreeGridItem): ModelTreeGridItem[] {
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
        const formFragmentsFolderItem: ModelTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.FORM_FRAGMENTS).setHasChildren(
                true).build();
        const mixinsFolderItem: ModelTreeGridItem =
            new UserTreeGridItemBuilder().setApplication(application).setType(UserTreeGridItemType.MIXINS).setHasChildren(
                true).build();
        return [partFolderItem, layoutFolderItem, pageFolderItem, contentTypesFolderItem, formFragmentsFolderItem, mixinsFolderItem];
    }

    private fetchComponents(folder: ModelTreeGridItem): Q.Promise<ModelTreeGridItem[]> {
        const dynamicSchemaType = this.getDynamicSchemaTypeForFolderItem(folder.getType());

        return this.loadChildren(folder, dynamicSchemaType);
    }

    private loadChildren(parentItem: ModelTreeGridItem, type: ComponentType | SchemaType): Q.Promise<ModelTreeGridItem[]> {
        if (parentItem.isPages() || parentItem.isParts() || parentItem.isLayouts()) {
            return new ListComponentsRequest()
                .setApplicationKey(parentItem.getApplication().getApplicationKey())
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

        if (parentItem.isContentTypes() || parentItem.isFormFragments() || parentItem.isMixins()) {
            return new ListSchemasRequest()
                .setApplicationKey(parentItem.getApplication().getApplicationKey())
                .setType(<SchemaType>type)
                .sendAndParse()
                .then((result: Schema[]) => {
                    const gridItems = [];
                    result.forEach((schema: Schema) => {
                        const builder = new UserTreeGridItemBuilder().setSchema(schema);

                        if (SchemaType.CONTENT_TYPE == schema.getType()) {
                            builder.setType(UserTreeGridItemType.CONTENT_TYPE);
                        }

                        if (SchemaType.FORM_FRAGMENT == schema.getType()) {
                            builder.setType(UserTreeGridItemType.FORM_FRAGMENT);
                        }

                        if (SchemaType.MIXIN == schema.getType()) {
                            builder.setType(UserTreeGridItemType.MIXIN);
                        }

                        gridItems.push(builder.build());

                    });

                    return gridItems;
                });
        }

        if (parentItem.isApplication()) {
            const style: Q.Promise<Styles> = new GetStylesRequest().setApplicationKey(
                parentItem.getApplication().getApplicationKey()).sendAndParse();

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

        return Q([]);
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

        if (itemType === UserTreeGridItemType.FORM_FRAGMENTS) {
            return SchemaType.FORM_FRAGMENT;
        }

        if (itemType === UserTreeGridItemType.MIXINS) {
            return SchemaType.MIXIN;
        }

        throw new Error('Invalid dynamic schema type for folder with components: ' + UserTreeGridItemType[itemType]);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('model-items-tree-list');

            return rendered;
        });
    }
}

export class ModelItemsTreeListElement
    extends TreeListElement<ModelTreeGridItem> {

    constructor(item: ModelTreeGridItem, params: TreeListElementParams<ModelTreeGridItem>) {
        super(item, params);
    }

    protected createChildrenList(params?: TreeListBoxParams<ModelTreeGridItem>): ModelItemsTreeList {
        return new ModelItemsTreeList(params);
    }

    getChildrenList(): ModelItemsTreeList {
        return this.childrenList as ModelItemsTreeList;
    }

    hasChildren(): boolean {
        return this.item.hasChildren();
    }

    protected createItemViewer(item: ModelTreeGridItem): ModelTreeGridItemViewer {
        const viewer = new ModelTreeGridItemViewer();
        viewer.setObject(item);
        viewer.setIsRelativePath(this.getLevel() > 0);
        return viewer;
    }
}
