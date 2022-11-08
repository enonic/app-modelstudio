import {
    getNodeById,
    getRelationsFromTarget,
    getRelationsFromSource,
    getRelationsByNodeDepth,
    getAllNodesByDepth,
    getSvgNodeId
} from '../helpers';
import {CLASSES} from '../constants';
import {Relation, Node, RenderOption, SVGRenderOptionsConfig} from '../interfaces';

export class SVGRenderOptionsBuilder {
    private config: SVGRenderOptionsConfig;
    private relations: Relation[];
    private nodes: Node[];
    private node: Node;

    private static readonly innerCircleID = 'SVG-inner-circle';
    private static readonly outerCircleID = 'SVG-outer-circle';

    constructor(config: SVGRenderOptionsConfig, relations: Relation[], nodes: Node[], node: Node) {
        this.config = config;
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
                childrenIdsToShow: children1.filter(childrenId => getRelationsFromSource(this.relations, childrenId).length > 0),
                relations: []
            },
            config: {
                id: SVGRenderOptionsBuilder.innerCircleID,
                class:CLASSES.hideOnRef,
                text: {size: this.config.textSize * 2},
                circle: {radius: this.config.circleRadius * 0.625}
            },
        };

        const children2: string[] = getAllNodesByDepth(this.nodes, 2)
            .reduce((acc, {id}) => [...acc, ...getRelationsFromSource(this.relations, id).map(({target}) => target)], []);

        const relations2: Relation[] = this.relations
            .filter(({source, target}) => children2.indexOf(source) >= 0 && children2.indexOf(target) >= 0);

        const options2: RenderOption = {
            data: {
                childrenIds: children2,
                childrenIdsToShow: children2,
                relations: relations2
            },
            config: {
                id: SVGRenderOptionsBuilder.outerCircleID,
                text: {size: this.config.textSize},
                circle: {radius: this.config.circleRadius}
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
                childrenIdsToShow: childrenIds,
                relations: filteredRelations
            },
            config: {
                id: `Render-${getSvgNodeId(node.id)}`,
                text: {size: this.config.textSize * 2},
                circle: {radius: this.config.circleRadius * 0.875}
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
                childrenIdsToShow: childrenIds,
                relations: filteredRelations
            },
            config: {
                id: `Render-${getSvgNodeId(node.id)}`,
                text: {size: this.config.textSize * 2},
                circle: {radius: this.config.circleRadius * 0.875}
            },
        };

        return [option];
    }
}