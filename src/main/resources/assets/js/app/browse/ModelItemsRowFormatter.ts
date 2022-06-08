import {ModelTreeGridItem} from './ModelTreeGridItem';
import {ModelTreeGridItemViewer} from './ModelTreeGridItemViewer';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';

export class ModelItemsRowFormatter {

    public static nameFormatter({}: Object, {}: Object, {}: Object, {}: Object, dataContext: TreeNode<ModelTreeGridItem>): string {
        let viewer = <ModelTreeGridItemViewer>dataContext.getViewer('displayName');
        if (!viewer) {
            viewer = new ModelTreeGridItemViewer();
            viewer.setIsRelativePath(dataContext.calcLevel() > 1);
            viewer.setObject(dataContext.getData());
            dataContext.setViewer('displayName', viewer);
        }
        return viewer.toString();
    }
}
