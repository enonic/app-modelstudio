import * as Q from 'q';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {SchemaVisualization} from '../visualization/SchemaVisualization';
import {ModelItemsTreeGrid} from '../browse/ModelItemsTreeGrid';
import {getNodeIdDetails, itemToNodeId, nodeIdToItemKey} from '../visualization/helpers';
import {CentralNodeInfo} from '../visualization/interfaces';
import {LoadMask} from '@enonic/lib-admin-ui/ui/mask/LoadMask';

export class ModelItemStatisticsPanel
    extends ItemStatisticsPanel {

    private treeGrid: ModelItemsTreeGrid;
    private schemaVisualization: SchemaVisualization;
    private loadMask: LoadMask;

    constructor() {
        super('model-item-statistics-panel');

        this.schemaVisualization = new SchemaVisualization();
        this.loadMask = new LoadMask(this);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.appendChild(this.schemaVisualization);
            return rendered;
        });
    }

    setItem(item: ModelTreeGridItem) {
        const currentItem = this.getItem();

        if (!currentItem || !currentItem.equals(item)) {
            super.setItem(item);
        }
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
        const nodeId = itemToNodeId(item);        

        if (treeGridAppKey === schemaVisualizationAppKey) {
            this.schemaVisualization.navigateToNode(nodeId);
        } else {
            this.setSchemaVisualizationData(treeGridAppKey, item, nodeId);
            this.schemaVisualization.refresh();
        }
    }

    private setSchemaVisualizationData(appKey: string, item: ModelTreeGridItem, navigateToAppKey?: string) {
        const centralNodeInfo: CentralNodeInfo = {
            name: item.getApplication().getDisplayName(),
            icon: item.getApplication().getIcon()
        };
        
        const onSchemaVisualizationDataLoadStart = () => { 
            this.loadMask.show(); 
            this.schemaVisualizationRenderHandler(appKey, navigateToAppKey);
        };

        const onSchemaVisualizationDataLoadEnd = () => { 
            this.loadMask.hide();
            this.schemaVisualizationNavigationHandler();
        };

        this.schemaVisualization.setData(appKey, centralNodeInfo, onSchemaVisualizationDataLoadStart, onSchemaVisualizationDataLoadEnd);
    }

    private schemaVisualizationRenderHandler(appKey: string, navigateToAppKey?: string): void {
        this.schemaVisualization.onRendered(() => {
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
            const itemKey = nodeIdToItemKey(appKey, nodeId);
            const prevItemKey = prevNodeId ? nodeIdToItemKey(appKey, prevNodeId): undefined;

            if(!this.treeGrid.isExpandedAndHasChildren(itemKey)) {
                const nodeIdDetails = getNodeIdDetails(nodeId);
                const typeKey = nodeIdToItemKey(appKey, nodeIdDetails.type);

                executeNavigation(typeKey, prevItemKey).then(() => executeNavigation(itemKey, prevItemKey));
                return;
            }

            executeNavigation(itemKey, prevItemKey);
        });
    }
}

