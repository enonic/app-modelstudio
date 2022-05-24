import {ModelItemStatisticsPanel} from '../view/ModelItemStatisticsPanel';
import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';

export class ModelBrowseItemPanel
    extends BrowseItemPanel {

    createItemStatisticsPanel(): ItemStatisticsPanel {
        return new ModelItemStatisticsPanel();
    }

}
