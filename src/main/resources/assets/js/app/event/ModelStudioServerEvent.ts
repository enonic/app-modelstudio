import {NodeEventJson, NodeServerEvent} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {NodeServerChangeType} from '@enonic/lib-admin-ui/event/NodeServerChange';
import {ModelStudioServerChange} from './ModelStudioServerChange';

export class ModelStudioServerEvent
    extends NodeServerEvent {

    constructor(change: ModelStudioServerChange) {
        super(change);
    }

    static is(eventJson: NodeEventJson): boolean {
        return eventJson.data.nodes.some(node => node.repo === 'system.app');
    }

    static fromJson(nodeEventJson: NodeEventJson): ModelStudioServerEvent {
        const change: ModelStudioServerChange = ModelStudioServerChange.fromJson(nodeEventJson);
        return new ModelStudioServerEvent(change);
    }

    getType(): NodeServerChangeType {
        return this.getNodeChange() ? this.getNodeChange().getChangeType() : null;
    }

    getNodeChange(): ModelStudioServerChange {
        return <ModelStudioServerChange>super.getNodeChange();
    }
}
