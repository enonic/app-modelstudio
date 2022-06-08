import {ModelItemStatisticsPanel} from '../view/ModelItemStatisticsPanel';
import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';

export class ModelBrowseItemPanel
    extends BrowseItemPanel {

    createItemStatisticsPanel(): ItemStatisticsPanel {
        return new ModelItemStatisticsPanel();
    }

}
