import * as Q from 'q';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {ModelItemStatisticsHeader} from './ModelItemStatisticsHeader';
import {TextArea} from '@enonic/lib-admin-ui/ui/text/TextArea';
import {SchemaVisualization} from '../visualization/SchemaVisualization';
import {ModelItemsTreeGrid} from '../browse/ModelItemsTreeGrid';
import {getNodeIdDetails} from '../visualization/helpers';
import {CentralNodeInfo} from '../visualization/interfaces';
import {LoadMask} from '@enonic/lib-admin-ui/ui/mask/LoadMask';
export class ModelItemStatisticsPanel
    extends ItemStatisticsPanel {

    private treeGrid: ModelItemsTreeGrid;
    private header: ModelItemStatisticsHeader;
    private descriptorTextArea: TextArea;
    private schemaVisualization: SchemaVisualization;
    private loadMask: LoadMask;

    constructor() {
        super('model-item-statistics-panel');

        this.initElements();

        this.loadMask = new LoadMask(this);
    }

    protected initElements(): void {
        this.header = new ModelItemStatisticsHeader();
        this.descriptorTextArea = new TextArea('descriptor-area');
        this.descriptorTextArea.hide();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.descriptorTextArea.getEl().setAttribute('readonly', '');
            //this.appendChild(this.header);
            //this.appendChild(this.descriptorTextArea);
            if (this.schemaVisualization) {
                this.appendChild(this.schemaVisualization);
            }

            return rendered;
        });
    }

    setItem(item: ModelTreeGridItem) {
        const currentItem = this.getItem();

        if (!currentItem || !currentItem.equals(item)) {
            this.refreshPanel(item);

            super.setItem(item);
            this.header.setItem(item);
        }
    }

    private refreshPanel(item: ModelTreeGridItem) {
        this.appendMetadata(item);
    }

    private appendMetadata(item: ModelTreeGridItem): void {
        const descriptor: string = this.getItemDescriptor(item);

        if (descriptor) {
            this.setResource(descriptor);
            this.descriptorTextArea.show();
        } else {
            this.descriptorTextArea.hide();
        }
    }

    private getItemDescriptor(item: ModelTreeGridItem): string {
        if (item.isComponent()) {
            return item.getComponent()?.getResource();
        }

        if (item.isSchema()) {
            return item.getSchema()?.getResource();
        }

        if (item.isSite()) {
            return item.getSite()?.getResource();
        }

        if (item.isStyles()) {
            return item.getStyles()?.getResource();
        }

        if (item.isApplication()) {
            return item.getApplication()?.getResource();
        }

        return '';
    }    

    private setResource(descriptor: string): void {
        this.descriptorTextArea.setValue(descriptor);
    }

    public setTreeGrid(treeGrid: ModelItemsTreeGrid) {
        this.treeGrid = treeGrid;
        this.addTreeGridListeners();
    }

    private addTreeGridListeners(): void {
        this.treeGrid.onHighlightingChanged(() => {
            const item: ModelTreeGridItem = this.treeGrid.getFirstSelectedOrHighlightedItem();
            this.treeGridNavigationHandler(item);
        });
    }

    // treeGrid -> Visualization
    private treeGridNavigationHandler(item: ModelTreeGridItem) {
        const treeGridAppKey = item.getApplication()?.getApplicationKey()?.toString() 
            || item.getComponent()?.getName()?.getApplicationKey()?.toString()
            || item.getSchema()?.getName().getApplicationKey().toString();

        if (!item || !treeGridAppKey) {
            return;
        }

        const schemaVisualizationAppKey = this.schemaVisualization?.appKey || '';

        // TODO: fix...
        const reRenderSchemaVisualization = (appKey: string, navigateToAppKey?: string)  => {
            this.removeChildren();
            this.setSchemaVisualization(appKey, item, navigateToAppKey);
            this.doRender();
        };

        const nodeId = this.itemToNodeId(item);        

        if (treeGridAppKey === schemaVisualizationAppKey) {
            this.schemaVisualization.navigateToNode(nodeId);
        } else {
            reRenderSchemaVisualization(treeGridAppKey, nodeId);
        }
    }

    private setSchemaVisualization(appKey: string, item: ModelTreeGridItem, navigateToAppKey?: string) {
        const centralNodeInfo: CentralNodeInfo = {
            name: item.getApplication().getDisplayName(),
            icon: item.getApplication().getIcon()
        };

        this.schemaVisualization = new SchemaVisualization(
            appKey, 
            centralNodeInfo, 
            '', 
            () => { this.loadMask.show(); },
            () => { this.loadMask.hide(); }
        );
        
        this.schemaVisualizationRenderHandler(appKey, navigateToAppKey);
    }

    private schemaVisualizationRenderHandler(appKey: string, navigateToAppKey?: string): void {
        this.schemaVisualization.onRendered(() => {
            // TODO: fix... otherwise schemaRender is not event set because of the async data request.
            this.schemaVisualizationNavigationHandler();
            
            this.treeGrid.highlightItemById(appKey, false);
            this.treeGrid.expandNodeByDataId(appKey);
            
            if (navigateToAppKey) {
                this.schemaVisualization.navigateToNode(navigateToAppKey);
            }
        }); 
    }
        
    // Visualization -> TreeGrid
    private schemaVisualizationNavigationHandler() {
        const executeNavigation = (itemKey: string, prevItemKey?: string): Q.Promise<boolean> => { 
            this.treeGrid.highlightItemById(itemKey, false);

            if (prevItemKey) {
                this.treeGrid.collapseNodeByDataId(prevItemKey);
            }

            if(this.treeGrid.isExpandedAndHasChildren(itemKey) !== undefined) {
                return this.treeGrid.expandNodeByDataId(itemKey);
            }

            return Q(true);            
        };

        this.schemaVisualization.onNavigation((appKey: string, nodeId: string, prevNodeId?: string): void => {
            const itemKey = this.nodeIdToItemKey(appKey, nodeId);
            const prevItemKey = prevNodeId ? this.nodeIdToItemKey(appKey, prevNodeId): undefined;

            console.log({
                hasItemWithDataId:this.treeGrid.hasItemWithDataId(itemKey),
                isExpandedAndHasChildren: this.treeGrid.isExpandedAndHasChildren(itemKey)
            });

            if(!this.treeGrid.isExpandedAndHasChildren(itemKey)) {
                const nodeIdDetails = getNodeIdDetails(nodeId);
                const typeKey = this.nodeIdToItemKey(appKey, nodeIdDetails.type);


                executeNavigation(typeKey, prevItemKey).then(() => executeNavigation(itemKey, prevItemKey));
                return;
            }

            executeNavigation(itemKey, prevItemKey);
        });
    }

    private nodeIdToItemKey(appKey: string, nodeId: string): string {
        const nodeIdDetails = getNodeIdDetails(nodeId);
        let itemKey: string;
        
        if (nodeIdDetails.type && !nodeIdDetails.appKey && !nodeIdDetails.schemaName) {
            const type = nodeIdDetails.type === 'CONTENT_TYPE' ? 'contentType' : nodeIdDetails.type.toLowerCase();
            itemKey = `${appKey}/${type}s`;
        } else {
            itemKey = nodeIdDetails.appKey;         
            itemKey += nodeIdDetails.schemaName ? `:${nodeIdDetails.schemaName}` : '';
        }

        return itemKey;
    }

    private itemToNodeId(item: ModelTreeGridItem): string {
        if (item.isApplication()) {
            return item.getApplication()?.getApplicationKey()?.toString();
        }
        if (item.isContentTypes()) {
            return 'CONTENT_TYPE';
        }
        if (item.isMixins()) {
            return 'MIXIN';
        }
        if (item.isXDatas()) {
            return 'XDATA';
        }
        if (item.isPages()) {
            return 'PAGE';
        }
        if (item.isLayouts()) {
            return 'LAYOUT';
        }
        if (item.isParts()) {
            return 'PART';
        }
        if (item.isContentType()) {
            return `CONTENT_TYPE@${item.getId()}`;
        }
        if (item.isMixin()) {
            return `MIXIN@${item.getId()}`;
        }
        if (item.isXData()) {
            return `XDATA@${item.getId()}`;
        }
        if (item.isPage()) {
            return `PAGE@${item.getId()}`;
        }
        if (item.isLayout()) {
            return `LAYOUT@${item.getId()}`;
        }
        if (item.isPart()) {
            return `PART@${item.getId()}`;
        }

        return '';
    }
}
