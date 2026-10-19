import {Event} from '@enonic/lib-admin-ui/event/Event';
import {EventJson} from '@enonic/lib-admin-ui/event/EventJson';
import {NodeEventJson} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {Message} from '@enonic/lib-admin-ui/notify/Message';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ModelStudioServerEventsTranslator} from './ModelStudioServerEventsTranslator';

interface AdminEventsClient {
    connect(handlers: {
        onEvent: (event: {topic: string, data: EventJson}) => void;
        onLoss: (loss: {topic: string, count: number | null}) => void;
        onConnectionChange: (connected: boolean) => void;
        onSessionEnd: () => void;
    }): {subscribe(topic: string): void};
}

export class ModelStudioServerEventsListener {

    private readonly translator: ModelStudioServerEventsTranslator = new ModelStudioServerEventsTranslator();

    private connectionMessageId: string;

    private connectionLostTimeout: number;

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
                    onLoss: () => this.handleLoss(),
                    onConnectionChange: (connected: boolean) => this.handleConnectionChange(connected),
                    onSessionEnd: () => this.handleSessionEnd()
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

    private handleConnectionChange(connected: boolean): void {
        this.hideConnectionMessage();
        if (!connected) {
            this.connectionLostTimeout = window.setTimeout(() => {
                this.connectionMessageId = NotifyManager.get().showError(i18n('notify.connection.loss'), false);
            }, 1000);
        }
    }

    private handleSessionEnd(): void {
        this.hideConnectionMessage();
        const message = Message.newError(i18n('notify.session.expired'), false);
        message.addAction(i18n('action.refresh'), () => window.location.reload());
        this.connectionMessageId = NotifyManager.get().notify(message);
    }

    private hideConnectionMessage(): void {
        window.clearTimeout(this.connectionLostTimeout);
        if (this.connectionMessageId) {
            NotifyManager.get().hide(this.connectionMessageId);
            this.connectionMessageId = null;
        }
    }
}
