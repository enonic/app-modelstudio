import * as d3 from 'd3';
import {Relation, Node, RenderOption} from './interfaces';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';

export function getDepth(relations: Relation[], nodeId: string, acc: number = 1): number {  
    const targets = getRelationsFromTarget(relations, nodeId);
  
    if (targets.length) {
        return Math.min(...targets.map(({source}) => getDepth(relations, source, acc + 1)));
    }

    return acc;
}

export function getRelationsFromTarget(relations: Relation[], nodeId: string): Relation[] {
    return relations.filter(node => node.target === nodeId);
}

export function getRelationsFromSource(relations: Relation[], nodeId: string): Relation[] {
    return relations.filter(node => node.source === nodeId);
}

export function getRelationsByNodeDepth(relations: Relation[], nodes: Node[], desiredDepth: number): Relation[] {
    const fnFilter = ({source, target}) => getNodeById(nodes, source).depth === desiredDepth 
        && getNodeById(nodes, target).depth === desiredDepth;

    return relations.filter(fnFilter);
}

export function getNodeById(nodes: Node[], nodeId: string): Node {
    return nodes.find(({id}) => id === nodeId);
}

export function getAllNodesByDepth(nodes: Node[], desiredDepth: number): Node[] {
    return nodes.filter(({depth}) => depth === desiredDepth);
}

export function getOuterTextSize(nodes: Node[]): number {
    const scale = d3.scaleLinear().domain([0, 250]).range([13, 10]);
    return Math.floor(scale(getOuterCircleRadius(nodes)));
}

export function getOuterCircleRadius(nodes: Node[]): number {
    const scale = d3.scaleLinear().domain([0, 100]).range([200, 300]);
    const quantityOfDepth3Nodes = getAllNodesByDepth(nodes, 3).length;
    return Math.floor(scale(quantityOfDepth3Nodes));
}

export function getNodeColor(relations: Relation[], nodes: Node[], node: Node, colors: Array<string>): string {

    if (node.depth === 2) {
        const index = relations
            .filter(({source}) => source === nodes[0].id) // TODO: FIX
            .findIndex(({target}) => target === node.id) + 1;

        return colors[index] || colors[colors.length - 1];
    }

    const n = relations.filter(({target}) => target == node.id)
          .sort((a,b) => getDepth(relations, nodes.find(({id}) => id === a.source).id) 
            - getDepth(relations, nodes.find(({id}) => id === b.source).id))
          .map(({source}) => nodes.find(({id}) => id === source));

    return n[0] ? getNodeColor(relations, nodes, n[0], colors) : 'lightgray';
}

export function getNodeColorByNodeId(relations: Relation[], nodes: Node[], nodeId: string, colors: Array<string>): string {
    return getNodeColor(relations, nodes, nodes.find(({id}) => id === nodeId), colors);
}

export function getFatherNodeId(relations: Relation[], nodes: Node[], node: Node): string {
    const relationsAbove = getRelationsFromTarget(relations, node.id)
        .filter(relation => getNodeById(nodes, relation.source).depth === node.depth - 1);
        
    return relationsAbove.length > 0 ? relationsAbove.map(x => x.source).pop() : '';
}

function getConstant(nodeIndex: number, max: number): number {
    return (2 * Math.PI) * nodeIndex/max - Math.PI/2;
}

export function getTextXPosition(nodeIndex: number, circleRadius: number, max: number): number{
    return Math.cos(getConstant(nodeIndex, max)) * circleRadius;
}

function getMarkerXPosition(nodeIndex: number, circleRadius: number, max: number, radiusOffset: number): number {
    return Math.cos(getConstant(nodeIndex, max)) * (circleRadius - radiusOffset - 12);
}

export function getTextYPosition(nodeIndex: number, circleRadius: number, max: number): number {
    return Math.sin(getConstant(nodeIndex, max)) * circleRadius;
}

function getMarkerYPosition(nodeIndex: number, circleRadius: number, max: number, radiusOffset: number): number {
    return Math.sin(getConstant(nodeIndex, max)) * (circleRadius - radiusOffset - 12);
}

export function getTextRotation(nodeIndex: number, max: number, radius: number, orientation=1): string {
    const k = getConstant(nodeIndex, max);
  
    const x = Math.cos(k) * radius;
    const y = Math.sin(k) * radius;
    const r = orientation === 1 ? Math.atan(y/x) * 180/Math.PI : Math.atan(y/x) * 180/Math.PI;
      
    return `rotate(${r}, ${x}, ${y})`;
}

export function getRelationsPathD(relation: Relation, option: RenderOption, manyChildren: boolean): string {
    const childrenIds = option.data.childrenIds;
    const radius = option.config.circle.radius;
    const textSize = option.config.text.size;
    const centralNode = option.data?.node;

    const sourceIndex = childrenIds.findIndex(x => x === relation.source);
    const targetIndex = childrenIds.findIndex(x => x === relation.target);

    const sourceRadiusOffset = getTextWidth(getCleanNodeId(relation.source), textSize) / 2;
    const targetRadiusOffset = getTextWidth(getCleanNodeId(relation.target), textSize) / 2;

    let x1 = sourceIndex >= 0 
        ? getMarkerXPosition(sourceIndex, radius, childrenIds.length, manyChildren ? sourceRadiusOffset : 0)
        : 0;
        
    let y1 = sourceIndex >= 0 
        ? getMarkerYPosition(sourceIndex, radius, childrenIds.length, manyChildren ? sourceRadiusOffset : 0) 
        : 0;
        
    let x2 = targetIndex >= 0 
        ? getMarkerXPosition(targetIndex, radius, childrenIds.length, manyChildren ? targetRadiusOffset : 0) 
        : 0;
        
    let y2 = targetIndex >= 0 
        ? getMarkerYPosition(targetIndex, radius, childrenIds.length, manyChildren ? targetRadiusOffset : 0) 
        : 0;

    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    if (centralNode && relation.source === centralNode.id) {
        if (!manyChildren) {
            x2 = getMarkerXPosition(targetIndex, radius, childrenIds.length, targetRadiusOffset);
        }
        const shortenFactorSource = 0.4;
        x1 = x1 + shortenFactorSource * (x2 - x1);
        y1 = y1 + shortenFactorSource * (y2 - y1);
        const shortenFactorTarget = 0.85;
        x2 = x1 + shortenFactorTarget * (x2 - x1);
        y2 = y1 + shortenFactorTarget * (y2 - y1);
    } else if (centralNode && relation.target === centralNode.id) {
        const shortenFactor = 0.5;
        x2 = x1 + shortenFactor * (x2 - x1);
        y2 = y1 + shortenFactor * (y2 - y1);
    } else if (!manyChildren) {
        const shortenFactor = length > radius ? 0.95 : 0.9;
        x2 = x1 + shortenFactor * (x2 - x1);
        y2 = y1 + shortenFactor * (y2 - y1);
    }

    return `M ${x1}, ${y1}, ${x2}, ${y2}`;
}

// TODO: Fix: find a simpler way to do that.
export function getTextWidth(str: string, fontSize: number): number {
    // eslint-disable-next-line max-len
    const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625];
    const avg = 0.5279276315789471;

  return Array.from(str).reduce((acc, cur) => acc + (widths[cur.charCodeAt(0)] ?? avg), 0) * fontSize;
}

export function buildNodeId(type: string, appKey: string, schemaName: string): string {
    return `${type}@${appKey}:${schemaName}`;
}

export function getNodeIdDetails(nodeId: string): NodeIdDetails {
    let appKey = '', type = '', schemaName = '';

    if (nodeId.indexOf('@') >= 0 && nodeId.indexOf(':') >= 0) {
        appKey = nodeId.replace(/.*@|:.*/g,'');
        type = nodeId.replace(/@.*/,'');
        schemaName = nodeId.replace(/.*:/,'');
    }

    if (nodeId.indexOf('.') >= 0) {
        appKey = nodeId.replace(/.*@|:.*/g,'');
    }

    type = nodeId.replace(/@.*/,'');

    return {appKey, type, schemaName};   
}

export function getCleanNodeId(nodeId: string): string {
    return nodeId.split(':').pop();//.replace(/-/g, ' ');
}

export function getNodeTitle(nodeId: string): string {
    return nodeId.replace(/(.*?)@/, '').toLowerCase();
}

export function getNodeDisplayName(nodeId: string): string {
    const nodeDetails = getNodeIdDetails(nodeId);
    const displayName = nodeDetails.schemaName || nodeDetails.type || nodeDetails.appKey;

    switch (displayName) {
        case 'PARTS':
            return i18n('field.parts');

        case 'LAYOUTS':
            return i18n('field.layouts');

        case 'PAGES':
            return i18n('field.pages');

        case 'CONTENT-TYPES':
            return i18n('field.contentTypes');

        case 'MIXINS':
            return i18n('field.mixins');

        case 'X-DATA':
            return i18n('field.xdatas');
    }    

    return displayName;
}

export function getIconKey(key: string): string {
    return key.toUpperCase().replace(/ |-/g, '_').replace(/[0-9]/g, '');
}

export function getSvgNodeId(nodeId: string): string {
    return nodeId.toLowerCase().replace(/ /g, '');
}

export function nodeIdToItemKey(appKey: string, nodeId: string): string {
    const nodeIdDetails = getNodeIdDetails(nodeId);
    let itemKey: string;
    
    if (nodeIdDetails.type && !nodeIdDetails.appKey && !nodeIdDetails.schemaName) {
        itemKey = `${appKey}/${nodeIdDetails.type.toLowerCase()}`;
    } else {
        itemKey = nodeIdDetails.appKey;         
        itemKey += nodeIdDetails.schemaName ? `:${nodeIdDetails.schemaName}` : '';
    }

    return itemKey;
}

export function itemToNodeId(item: ModelTreeGridItem): string {
    if (item.isApplication()) {
        return item.getApplication()?.getApplicationKey()?.toString();
    }
    if (item.isContentTypes()) {
        return 'CONTENT-TYPES';
    }
    if (item.isMixins()) {
        return 'MIXINS';
    }
    if (item.isXDatas()) {
        return 'X-DATA';
    }
    if (item.isPages()) {
        return 'PAGES';
    }
    if (item.isLayouts()) {
        return 'LAYOUTS';
    }
    if (item.isParts()) {
        return 'PARTS';
    }
    if (item.isContentType()) {
        return `CONTENT-TYPES@${item.getId()}`;
    }
    if (item.isMixin()) {
        return `MIXINS@${item.getId()}`;
    }
    if (item.isXData()) {
        return `X-DATA@${item.getId()}`;
    }
    if (item.isPage()) {
        return `PAGES@${item.getId()}`;
    }
    if (item.isLayout()) {
        return `LAYOUTS@${item.getId()}`;
    }
    if (item.isPart()) {
        return `PARTS@${item.getId()}`;
    }

    return '';
}

interface NodeIdDetails {
    appKey: string,
    type: string,
    schemaName: string
}