
import {getDepth, getRelationsFromSource, getRelationsFromTarget} from './helpers';
import {Relation, Node} from './interfaces';

export default class SchemaData {
    relations: Relation[];
    nodes: Node[];

    constructor(relations: Relation[]) {
        this.setRelations(relations);
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
        this.relations = [...relations, ...this.getAdditionalMixinRelations(relations)];
    }

    private setNodes(): void {
        const setOfNodeIds: Set<string> = new Set();

        this.relations.forEach(({source, target}) => {
            setOfNodeIds.add(source);
            setOfNodeIds.add(target);
        });

        const arrayOfNodeIds = Array.from(setOfNodeIds);

        this.nodes = arrayOfNodeIds.map(nodeId => ({'id': nodeId, 'depth': getDepth(this.relations, nodeId)}));
    }

    private getAdditionalMixinRelations(relations: Relation[]) {
        const mixinIds = getRelationsFromSource(relations, 'MIXIN').map(({target}) => target);

        let additionalMixinRelations = [];

        mixinIds.forEach(mixinId => {
            const sourceIds = getRelationsFromTarget(relations, mixinId).map(({source}) => source).filter(id => id !== 'MIXIN');
            const targetIds = getRelationsFromSource(relations, mixinId).map(({target}) => target).filter(id => id !== 'MIXIN');
            
            sourceIds.forEach(source => targetIds.forEach(target => additionalMixinRelations.push({source, target, dash: true})));
        });

        return additionalMixinRelations;
    }
}