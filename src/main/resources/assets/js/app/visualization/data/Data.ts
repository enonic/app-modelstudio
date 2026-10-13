import {UrlHelper} from '../../util/UrlHelper';
import {getCleanNodeId, getDepth, getNodeDisplayName, getRelationsFromSource, getRelationsFromTarget} from '../helpers';
import {Relation, Node, Details} from '../interfaces';

export class Data {
    relations: Relation[];
    details: Details;
    nodes: Node[];

    constructor(relations: Relation[], details: Details) {
        this.setRelations(relations);
        this.details = details;
        this.setNodes();
    }

    public getRelations(): Relation[] {
        return this.relations;
    }

    public getNodes(): Node[] {
        return this.nodes;
    }

    public getFirstNode(): Node {
        if(this.nodes.length) {
            return this.nodes[0];
        }

        return {} as Node;
    }

    private setRelations(relations: Relation[]): void {   
        this.relations = [...relations, ...this.getAdditionalFormFragmentRelations(relations)];
    }

    private setNodes(): void {
        const setOfNodeIds: Set<string> = new Set();

        this.relations.forEach(({source, target}) => {
            setOfNodeIds.add(source);
            setOfNodeIds.add(target);
        });

        const arrayOfNodeIds = Array.from(setOfNodeIds);

        this.nodes = arrayOfNodeIds.map(nodeId => this.getNodeData(nodeId));
    }

    private getAdditionalFormFragmentRelations(relations: Relation[]) {
        const formFragmentIds = getRelationsFromSource(relations, 'FORM_FRAGMENT').map(({target}) => target);

        let additionalFormFragmentRelations = [];

        formFragmentIds.forEach(formFragmentId => {
            const sourceIds = getRelationsFromTarget(relations, formFragmentId).map(({source}) => source).filter(id => id !== 'FORM_FRAGMENT');
            const targetIds = getRelationsFromSource(relations, formFragmentId).map(({target}) => target).filter(id => id !== 'FORM_FRAGMENT');
            
            sourceIds.forEach(source => targetIds.forEach(target => additionalFormFragmentRelations.push({source, target, dash: true})));
        });

        return additionalFormFragmentRelations;
    }

    private isNodeClickable(nodeId: string): boolean {
        return !nodeId.includes('base:') 
            && !nodeId.includes('media:')
            && !nodeId.includes('portal:');
    }

    private getIconUrl(type: string, key: string): string {
        if (type === 'application') {
            return UrlHelper.getCmsRestUri('apps/application/icon/') + key;
        }
        if (type === 'content-types') {
            return UrlHelper.getCmsRestUri('cs/schema/content/icon/') + key;
        }
        if (type === 'parts') {
            return UrlHelper.getCmsRestUri('cs/content/page/part/descriptor/icon/') + key;
        }
        if (type === 'layouts') {
            return UrlHelper.getCmsRestUri('cs/schema/content/icon/portal:page-template');
        }
        if (type === 'pages' || type === 'form-fragments' || type === 'mixins') {
            return UrlHelper.getCmsRestUri('cs/schema/content/icon/media:document');
        }
        
        return UrlHelper.getCmsRestUri('cs/schema/content/icon/base:folder');
    }

    private getNodeData(nodeId: string): Node {
        const details = this.details[nodeId];

        return {
            id: nodeId, 
            depth: getDepth(this.relations, nodeId),
            clickable: this.isNodeClickable(nodeId),
            key: details ? details.key : '',
            displayName: details ? getNodeDisplayName(details.displayName) : getCleanNodeId(nodeId),
            type: details ? details.type : 'unknown',
            icon: details ? this.getIconUrl(details.type, details.key) : '',
        };
    }
}