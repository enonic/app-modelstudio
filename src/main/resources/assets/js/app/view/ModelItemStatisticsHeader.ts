import {ItemStatisticsHeader} from 'lib-admin-ui/app/view/ItemStatisticsHeader';
import {ModelTreeGridItem, UserTreeGridItemType} from '../browse/ModelTreeGridItem';

export class ModelItemStatisticsHeader
    extends ItemStatisticsHeader {

    setItem(item: ModelTreeGridItem): void {
        super.setItem(item);
    }
}
