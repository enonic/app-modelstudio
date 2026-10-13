import {Event} from '@enonic/lib-admin-ui/event/Event';
import {EventJson} from '@enonic/lib-admin-ui/event/EventJson';
import {NodeEventJson} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {ModelStudioServerEventsTranslator} from './ModelStudioServerEventsTranslator';

interface AdminEventsClient {
    connect(handlers: {
        onEvent: (event: {topic: string, data: EventJson}) => void;
        onLoss: (loss: {topic: string, count: number | null}) => void;
    }): {subscribe(topic: string): void};
}

export class ModelStudioServerEventsListener {

    private readonly translator: ModelStudioServerEventsTranslator = new ModelStudioServerEventsTranslator();

    start(): void {
        const eventsUrl: string = CONFIG.getString('eventsUrl');
        const eventsTopic: string = CONFIG.getString('eventsTopic');

        if (!eventsUrl || !eventsTopic) {
            return;
        }

        import(/* @vite-ignore */ `${eventsUrl}/client.js`)
            .then((client: AdminEventsClient) => {
                client.connect({
                    onEvent: ({data}) => this.handleEvent(data),
                    onLoss: () => this.handleLoss()
                }).subscribe(eventsTopic);
            })
            .catch(e => console.error('Failed to load the admin events client:', e));
    }

    private handleEvent(eventJson: EventJson): void {
        const event: Event = this.translator.translateServerEvent(eventJson);
        if (event) {
            event.fire();
        }
    }

    private handleLoss(): void {
        const reloadEvent: NodeEventJson = {type: 'node.updated', timestamp: Date.now(), data: {nodes: []}};
        this.handleEvent(reloadEvent);
    }
}
