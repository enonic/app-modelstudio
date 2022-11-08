import * as Q from 'q';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {Visualization} from '../visualization/Visualization';
import {ModelItemsTreeGrid} from '../browse/ModelItemsTreeGrid';
import {LoadMask} from '@enonic/lib-admin-ui/ui/mask/LoadMask';

export class ModelItemStatisticsPanel extends ItemStatisticsPanel {

    private treeGrid: ModelItemsTreeGrid;
    private schemaVisualization: Visualization;
    private loadMask: LoadMask;

    constructor() {
        super('model-item-statistics-panel');
        this.loadMask = new LoadMask(this);
        this.setSchemaVisualization();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.appendChild(this.schemaVisualization);
            return rendered;
        });
    }

    setItem(item: ModelTreeGridItem): void {
        const currentItem = this.getItem();

        if (!currentItem || !currentItem.equals(item)) {
            super.setItem(item);
        }
    }

    setTreeGrid(treeGrid: ModelItemsTreeGrid): void {
        this.treeGrid = treeGrid;
        this.treeGridNavigationHandler();
    }

    private treeGridNavigationHandler(): void {
        this.treeGrid.onHighlightingChanged(() => {
            const item: ModelTreeGridItem = this.treeGrid.getFirstSelectedOrHighlightedItem();
                const treeGridAppKey = item.getApplication()?.getApplicationKey()?.toString()
                || item.getComponent()?.getName()?.getApplicationKey()?.toString()
                || item.getSchema()?.getName().getApplicationKey().toString();

            if (!item || !treeGridAppKey) {
                return;
            }

            const schemaVisualizationAppKey = this.schemaVisualization?.appKey || '';
            const nodeId = item.getId();

            if (treeGridAppKey === schemaVisualizationAppKey) {
                this.schemaVisualization.navigateToNode(nodeId);
            } else {
                this.setSchemaVisualizationData(treeGridAppKey, nodeId);
                this.schemaVisualization.doRender();
            }
        });
    }

    private setSchemaVisualization(): void {
        this.schemaVisualization = new Visualization();
        this.schemaVisualizationOnNavigateHandler();
    }

    private setSchemaVisualizationData(appKey: string, nodeId?: string): void {
        const onSchemaVisualizationDataLoadStart = () => {
            this.loadMask.show();
        };

        const onSchemaVisualizationDataLoadEnd = () => {
            this.loadMask.hide();
            this.schemaVisualizationRenderHandler(appKey, nodeId);
        };

        this.schemaVisualization.setData(appKey, onSchemaVisualizationDataLoadStart, onSchemaVisualizationDataLoadEnd);
    }

    private schemaVisualizationRenderHandler(appKey: string, nodeId?: string): void {
        if (nodeId) {
            this.schemaVisualization.navigateToNode(nodeId);
        } else {
            this.treeGrid.highlightItemById(appKey, false, true); // check this!
        }
    }

    private schemaVisualizationOnNavigateHandler(): void {
        this.schemaVisualization.onNavigate((nodeIds: string[], nodeIdToCollapse?: string) => {
            if (nodeIdToCollapse) {
                this.treeGrid.collapseNodeByDataId(nodeIdToCollapse);
            }

            nodeIds.reduce((prev: Q.Promise<void>, nodeId: string, index: number) => {
                return prev.then(() => {
                    if(index === nodeIds.length - 1) {
                        if (this.treeGrid.hasItemWithDataId(nodeId)) {
                            this.treeGrid.highlightItemById(nodeId, true, true);
                        }
                        return;
                    }

                    return this.treeGrid.expandNodeByDataId(nodeId).then(() => {
                        if (this.treeGrid.hasItemWithDataId(nodeId)) {
                            this.treeGrid.highlightItemById(nodeId, true, true);
                        }
                    });
                });
            }, Q());
        });
    }
}

