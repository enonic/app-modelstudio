import {NodeServerChange, NodeServerChangeBuilder} from '@enonic/lib-admin-ui/event/NodeServerChange';
import {NodeEventJson, NodeEventNodeJson} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {ModelStudioServerChangeItem} from './ModelStudioServerChangeItem';

export class ModelStudioServerChange
    extends NodeServerChange {

    constructor(builder: ModelStudioServerChangeBuilder) {
        super(builder);
    }

    static fromJson(nodeEventJson: NodeEventJson): ModelStudioServerChange {
        return new ModelStudioServerChangeBuilder().fromJson(nodeEventJson).build();
    }
}

export class ModelStudioServerChangeBuilder
    extends NodeServerChangeBuilder {

    build(): ModelStudioServerChange {
        return new ModelStudioServerChange(this);
    }

    nodeJsonToChangeItem(node: NodeEventNodeJson): ModelStudioServerChangeItem {
        return ModelStudioServerChangeItem.fromJson(node);
    }

}
