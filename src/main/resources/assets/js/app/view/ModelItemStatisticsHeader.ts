import {ItemStatisticsHeader} from '@enonic/lib-admin-ui/app/view/ItemStatisticsHeader';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';

export class ModelItemStatisticsHeader
    extends ItemStatisticsHeader {

    setItem(item: ModelTreeGridItem): void {
        super.setItem(item);
    }
}
