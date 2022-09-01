import * as Q from 'q';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {ModelItemStatisticsHeader} from './ModelItemStatisticsHeader';
import {TextArea} from '@enonic/lib-admin-ui/ui/text/TextArea';
import {SchemaVisualization} from '../visualization/SchemaVisualization';
import {ModelItemsTreeGrid} from '../browse/ModelItemsTreeGrid';
import {getNodeIdDetails} from '../visualization/helpers';
export class ModelItemStatisticsPanel
    extends ItemStatisticsPanel {

    private treeGrid: ModelItemsTreeGrid;
    private header: ModelItemStatisticsHeader;
    private descriptorTextArea: TextArea;
    private schemaVisualization: SchemaVisualization;

    constructor() {
        super('model-item-statistics-panel');

        this.initElements();
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
            this.treeGridSchemaVisualizationNavigation(item);
        });
    }

    private treeGridSchemaVisualizationNavigation(item: ModelTreeGridItem) {
        //TODO: FIX;
        if (item.isApplication()) {
            const appKey = item.getApplication().getApplicationKey().toString();
            this.removeChildren();
            this.setSchemaVisualization(item);
            this.doRender().then(() => {
                this.schemaVisualization.navigateToNode(appKey);
                console.log('Tree Grid -> Schemas Visualization', appKey);
            });
            
            return;
        }

        let nodeId = '';

        if(item.isContentTypes()) {
            nodeId = 'CONTENT_TYPE';
        }
        if(item.isMixins()) {
            nodeId = 'MIXIN';
        }
        if(item.isXDatas()) {
            nodeId = 'XDATA';
        }
        if(item.isPages()) {
            nodeId = 'PAGE';
        }
        if(item.isLayouts()) {
            nodeId = 'LAYOUT';
        }
        if(item.isParts()) {
            nodeId = 'PART';
        }
        if(item.isContentType()) {
            nodeId = `CONTENT_TYPE@${item.getId()}`;
        }
        if(item.isMixin()) {
            nodeId = `MIXIN@${item.getId()}`;
        }
        if(item.isXData()) {
            nodeId = `XDATA@${item.getId()}`;
        }
        if(item.isPage()) {
            nodeId = `PAGE@${item.getId()}`;
        }
        if(item.isLayout()) {
            nodeId = `LAYOUT@${item.getId()}`;
        }
        if(item.isPart()) {
            nodeId = `PART@${item.getId()}`;
        }

        this.schemaVisualization.navigateToNode(nodeId);

        console.log('Tree Grid -> Schemas Visualization', nodeId);
    }

    private setSchemaVisualization(item: ModelTreeGridItem) {
        const appKey = item.getApplication().getApplicationKey().toString();
        this.schemaVisualization = new SchemaVisualization(appKey);
        // TODO: fix... otherwise schemaRender is not event set because of the async data request.
        this.schemaVisualization.onRendered(() => this.addSchemaVisualizationListeners()); 
    }
        
    private addSchemaVisualizationListeners(): void {
        const nodeIdToItemKey = (appKey: string, nodeId: string): string => {
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
        };

        this.schemaVisualization.onNavigation((appKey: string, nodeId: string, prevNodeId?: string) => {
            const itemKey = nodeIdToItemKey(appKey, nodeId);
            
            console.log('Schemas Visualization -> Tree Grid', itemKey);
            
            this.treeGrid.selectNode(itemKey);
            this.treeGrid.expandNodeByDataId(itemKey);

            if (prevNodeId) {
                const prevItemKey = nodeIdToItemKey(appKey, prevNodeId);
                this.treeGrid.collapseNodeByDataId(prevItemKey);
            }
            
        });
    }
}
