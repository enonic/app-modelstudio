import {NodeServerChangeItem, NodeServerChangeItemBuilder} from '@enonic/lib-admin-ui/event/NodeServerChangeItem';
import {NodeEventNodeJson} from '@enonic/lib-admin-ui/event/NodeServerEvent';

export class ModelStudioServerChangeItem
    extends NodeServerChangeItem {

    constructor(builder: ModelStudioServerChangeItemBuilder) {
        super(builder);
    }

    static fromJson(json: NodeEventNodeJson): ModelStudioServerChangeItem {
        return new ModelStudioServerChangeItemBuilder().fromJson(json).build();
    }
}

export class ModelStudioServerChangeItemBuilder
    extends NodeServerChangeItemBuilder {

    fromJson(json: NodeEventNodeJson): ModelStudioServerChangeItemBuilder {
        super.fromJson(json);

        return this;
    }

    build(): ModelStudioServerChangeItem {
        return new ModelStudioServerChangeItem(this);
    }
}
