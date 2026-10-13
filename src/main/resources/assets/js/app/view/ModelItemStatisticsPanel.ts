import Q from 'q';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {Visualization} from '../visualization/Visualization';
import {ModelItemsTreeList} from '../browse/ModelItemsTreeList';
import {LoadMask} from '@enonic/lib-admin-ui/ui/mask/LoadMask';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class ModelItemStatisticsPanel extends ItemStatisticsPanel {

    private treeList: ModelItemsTreeList;
    private selectionWrapper: SelectableListBoxWrapper<ModelTreeGridItem>;
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

    setTreeList(treeList: ModelItemsTreeList, selectionWrapper: SelectableListBoxWrapper<ModelTreeGridItem>): void {
        this.treeList = treeList;
        this.selectionWrapper = selectionWrapper;
        this.treeListNavigationHandler();
    }

    private treeListNavigationHandler(): void {
        this.selectionWrapper.onSelectionChanged(() => {
            const item: ModelTreeGridItem = this.selectionWrapper.getSelectedItems()[0];

            if (!item) {
                return;
            }

            const treeGridAppKey = item.getApplication()?.getApplicationKey()?.toString()
                || item.getComponent()?.getName()?.getApplicationKey()?.toString()
                || item.getSchema()?.getName().getApplicationKey().toString();

            if (!treeGridAppKey) {
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
            this.selectItemById(appKey);
        }
    }

    private schemaVisualizationOnNavigateHandler(): void {
        this.schemaVisualization.onNavigate((nodeIds: string[], nodeIdToCollapse?: string) => {
            if (nodeIdToCollapse) {
                this.treeList.collapseItem(nodeIdToCollapse);
            }

            const highlightAndScroll = (nodeId: string) => {
                if (!this.treeList.getItem(nodeId)) {
                    return;
                }

                this.selectItemById(nodeId);
                this.treeList.scrollToItem(nodeId);
            };

            nodeIds.reduce((prev: Q.Promise<void>, nodeId: string, index: number) => {
                return prev.then(() => {
                    if(index === nodeIds.length - 1) {
                        highlightAndScroll(nodeId);
                        return;
                    }

                    return this.treeList.expandItem(nodeId).then(() => {
                        highlightAndScroll(nodeId);
                    });
                });
            }, Q());
        });
    }

    private selectItemById(id: string): void {
        const item: ModelTreeGridItem = this.treeList.getItem(id);

        if (!item) {
            return;
        }

        this.selectionWrapper.deselectAll(true);
        this.selectionWrapper.select(item, true);
    }
}
