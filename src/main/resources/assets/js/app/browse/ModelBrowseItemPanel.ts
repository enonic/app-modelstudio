import {ModelItemStatisticsPanel} from '../view/ModelItemStatisticsPanel';
import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {ModelItemsTreeGrid} from './ModelItemsTreeGrid';

export class ModelBrowseItemPanel
    extends BrowseItemPanel {

    private modelItemStatisticsPanel: ModelItemStatisticsPanel;

    constructor(treeGrid: ModelItemsTreeGrid) {
        super();
        
        this.setModelItemStatiscsPanelTreeGrid(treeGrid);
    }

    createItemStatisticsPanel(): ItemStatisticsPanel {
        this.modelItemStatisticsPanel = new ModelItemStatisticsPanel();
        return this.modelItemStatisticsPanel;
    }

    setModelItemStatiscsPanelTreeGrid(treeGrid: ModelItemsTreeGrid): void {
        this.modelItemStatisticsPanel.setTreeGrid(treeGrid);
    }
}
