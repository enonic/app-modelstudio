import {
    getNodeById,
    getRelationsFromTarget,
    getRelationsFromSource,
    getRelationsByNodeDepth,
    getAllNodesByDepth,
    getSvgNodeId
} from './helpers';

import {Relation, Node, RenderGlobalConfig, RenderOption} from './interfaces';

export class SchemaRenderOptionsBuilder {
    globalConfig: RenderGlobalConfig;
    relations: Relation[];
    nodes: Node[];
    node: Node;

    constructor(globalConfig: RenderGlobalConfig, relations: Relation[], nodes: Node[], node: Node) {
        this.globalConfig = globalConfig;
        this.relations = relations,
        this.nodes = nodes;
        this.node = node;
    }

    public build() {
        if (this.node.depth === 1) {
            return this.getOptionsNodeDepth1(this.node);
        }

        if (this.node.depth === 2) {
            return this.getOptionsNodeDepth2(this.node);
        }

        if (this.node.depth === 3) {
            return this.getOptionsNodeDepth3(this.node);
        }
    }

    private getOptionsNodeDepth1(node: Node): RenderOption[] {
        if (node.depth !== 1) {
            return;
        }
        
        const node1: Node = getNodeById(this.nodes, node.id);
        const children1: string[] = getRelationsFromSource(this.relations, node.id).map(({target}) => target);

        const options1: RenderOption = {
            data: {
                node: node1,
                childrenIds: children1,
                relations: [],
                techAppName: node1.id
            },
            config: {
                id: this.globalConfig.ids.innerCircle,
                class: this.globalConfig.classnames.hideOnRef,
                text: {size: this.globalConfig.text.size * 2},
                circle: {radius: this.globalConfig.circle.radius / 2}
            },
        };

        const children2: string[] = getAllNodesByDepth(this.nodes, 2)
            .reduce((acc, {id}) => [...acc, ...getRelationsFromSource(this.relations, id).map(({target}) => target)], []);

        const relations2: Relation[] = this.relations
            .filter(({source, target}) => children2.indexOf(source) >= 0 && children2.indexOf(target) >= 0);

        const options2: RenderOption = {
            data: {
                childrenIds: children2,
                relations: relations2
            },
            config: {
                id: this.globalConfig.ids.outerCircle,
                text: {size: this.globalConfig.text.size},
                circle: {radius: this.globalConfig.circle.radius}
            },
        };

        return [options1, options2];
    }

    private getOptionsNodeDepth2(node: Node): RenderOption[] {
        if (node.depth !== 2) {
            return;
        }

        const childrenIds: string[] = getRelationsFromSource(this.relations, node.id).map(({target}) => target);
        const filteredRelations: Relation[] = this.relations
            .filter(x => childrenIds.indexOf(x.source) >= 0 && childrenIds.indexOf(x.target) >= 0);

        const option: RenderOption = {
            data: {
                node,
                childrenIds,
                relations: filteredRelations
            },
            config: {
                id: `Render-${getSvgNodeId(node.id)}`,
                text: {size: this.globalConfig.text.size * 2},
                circle: {radius: this.globalConfig.circle.radius}
            },
        };

        return [option];
    }

    private getOptionsNodeDepth3(node: Node): RenderOption[] {
        if (node.depth !== 3) {
            return;
        }

        const childrenIds = Array.from(new Set([
            ...getRelationsByNodeDepth(getRelationsFromSource(this.relations, node.id), this.nodes, 3)
                .map(({target}) => target),
            ...getRelationsByNodeDepth(getRelationsFromTarget(this.relations, node.id), this.nodes, 3)
                .map(({source}) => source)
        ]));

        const filteredRelations = this.relations
            .filter(({source, target}) => (
                source === node.id &&
                childrenIds.indexOf(target) >= 0) ||
                (target === node.id && childrenIds.indexOf(source) >= 0)
            );

        const option = {
            data: {
                node,
                childrenIds,
                relations: filteredRelations
            },
            config: {
                id: `Render-${getSvgNodeId(node.id)}`,
                text: {size: this.globalConfig.text.size * 2},
                circle: {radius: this.globalConfig.circle.radius}
            },
        };

        return [option];
    }
}