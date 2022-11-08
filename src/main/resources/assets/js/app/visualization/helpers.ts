import * as d3 from 'd3';
import {Relation, Node, RenderOption} from './interfaces';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {Checkbox} from '@enonic/lib-admin-ui/ui/Checkbox';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';

export function getDepth(relations: Relation[], nodeId: string, acc: number = 1): number {
    const targets = getRelationsFromTarget(relations, nodeId).filter(rel => rel.source !== nodeId);

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

// TODO: Fix: find a simpler way to do that.
export function getTextWidth(str: string, fontSize: number): number {
    // eslint-disable-next-line max-len
    const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625];
    const avg = 0.5279276315789471;

  return Array.from(str).reduce((acc, cur) => acc + (widths[cur.charCodeAt(0)] ?? avg), 0) * fontSize;
}

export function getCleanNodeId(nodeId: string): string {
    return nodeId.split(':').pop();//.replace(/-/g, ' ');
}

export function getNodeDisplayName(displayName: string): string {
    switch (displayName) {
        case 'parts':
            return i18n('field.parts');

        case 'layouts':
            return i18n('field.layouts');

        case 'pages':
            return i18n('field.pages');

        case 'content-types':
            return i18n('field.contentTypes');

        case 'mixins':
            return i18n('field.mixins');

        case 'x-data':
            return i18n('field.xdatas');
    }

    return displayName;
}

export function getSvgNodeId(nodeId: string): string {
    return nodeId.toLowerCase().replace(/ /g, '');
}

export function setUniqueListener(
        element: InputEl | Checkbox,
        listenerType: string,
        fnHandler: (e: Event) => void,
        debounceTime: number = 0
    ): void {

    if (element) {
        const key = `has-${listenerType}`;
        const handler = AppHelper.debounce(fnHandler, debounceTime);

        if (!element[key]) {
            element[key] = true;
            element[listenerType](handler);
        }
    }
}

export function getAscendantNodeIds(relations: Relation[], nodes: Node[], nodeId: string) {
    let nId = nodeId;
    let arr: string[] = [nId];

    while (getFatherNodeId(relations, nodes, getNodeById(nodes, nId))) {
        nId = getFatherNodeId(relations, nodes, getNodeById(nodes, nId));

        arr = [nId, ...arr];
    }

    return arr;
}

export function getRelationsPath(relation: Relation, option: RenderOption, manyChildren: boolean): string {
    return (relation.source === relation.target)
        ? getCircularArrowPath(option, relation)
        : getArrowPath(option, relation, manyChildren);
}

function getCircularArrowPath(option: RenderOption, relation: Relation) {
    const childrenIds = option.data.childrenIds;
    const radius = option.config.circle.radius;
    const textSize = option.config.text.size;

    const sourceIndex = childrenIds.findIndex(x => x === relation.source);
    const sourceRadiusOffset = getTextWidth(getCleanNodeId(relation.source), textSize) / 2;

    const x = sourceIndex >= 0 ? getTextXPosition(sourceIndex, radius, childrenIds.length) : 0;
    const y = sourceIndex >= 0 ? getTextYPosition(sourceIndex, radius, childrenIds.length) : 0;
    const verticalOrientation = y < 0 ? -1 : 1;

    const coordinates = getCoordinates(
        x - 1.5 * sourceRadiusOffset,
        y + verticalOrientation * 2.5,
        x + 1.5 * sourceRadiusOffset,
        y + verticalOrientation * 2.5,
    );

    const k = Math.abs(coordinates.end.x- coordinates.start.x) / 3;

    const controlCoordinates = getCoordinates(
        coordinates.start.x - k,
        coordinates.start.y + verticalOrientation * k,
        coordinates.end.x + k,
        coordinates.end.y + verticalOrientation * k
    );

    return `
        M ${coordinates.start.x},${coordinates.start.y} 
        C ${controlCoordinates.start.x},${controlCoordinates.start.y} 
        ${controlCoordinates.end.x},${controlCoordinates.end.y} 
        ${coordinates.end.x},${coordinates.end.y}
    `;
}

function getArrowPath(option: RenderOption, relation: Relation, manyChildren: boolean): string {
    const childrenIds = option.data.childrenIds;
    const radius = option.config.circle.radius;
    const textSize = option.config.text.size;
    const centralNode = option.data?.node;

    const sourceIndex = childrenIds.findIndex(x => x === relation.source);
    const targetIndex = childrenIds.findIndex(x => x === relation.target);
    const sourceRadiusOffset = getTextWidth(getCleanNodeId(relation.source), textSize) / 2;
    const targetRadiusOffset = getTextWidth(getCleanNodeId(relation.target), textSize) / 2;

    let x1 = sourceIndex >= 0 ? getMarkerXPosition(sourceIndex, radius, childrenIds.length, manyChildren ? sourceRadiusOffset : 0) : 0;
    let y1 = sourceIndex >= 0 ? getMarkerYPosition(sourceIndex, radius, childrenIds.length, manyChildren ? sourceRadiusOffset : 0) : 0;
    let x2 = targetIndex >= 0 ? getMarkerXPosition(targetIndex, radius, childrenIds.length, manyChildren ? targetRadiusOffset : 0) : 0;
    let y2 = targetIndex >= 0 ? getMarkerYPosition(targetIndex, radius, childrenIds.length, manyChildren ? targetRadiusOffset : 0) : 0;

    if (centralNode && relation.source === centralNode.id) {
        if (!manyChildren) {
            x2 = getMarkerXPosition(targetIndex, radius, childrenIds.length, targetRadiusOffset);
        }
        return getArrowPathFromCenter(x1, y1, x2, y2);
    }

    if (centralNode && relation.target === centralNode.id) {
        return getArrowPathToCenter(x1, y1, x2, y2);
    }

    if (!manyChildren) {
        x2 = getMarkerXPosition(targetIndex, radius, childrenIds.length, targetRadiusOffset);
        return getShortenedArrowPath(x1, y1, x2, y2, radius);
    }

    return getPath(x1, y1, x2, y2);
}

function getArrowPathFromCenter(x1: number, y1: number, x2: number, y2: number): string {
    x1 = 0;
    y1 = 0;
    const shortenFactorSource = 0.4;
    const shortenFactorTarget = 0.85;
    x1 = x1 + shortenFactorSource * (x2 - x1);
    y1 = y1 + shortenFactorSource * (y2 - y1);
    x2 = x1 + shortenFactorTarget * (x2 - x1);
    y2 = y1 + shortenFactorTarget * (y2 - y1);

    return getPath(x1, y1, x2, y2);
}

function getArrowPathToCenter(x1: number, y1: number, x2: number, y2: number): string {
    const shortenFactor = 0.5;
    x2 = x1 + shortenFactor * (x2 - x1);
    y2 = y1 + shortenFactor * (y2 - y1);

    return getPath(x1, y1, x2, y2);
}

function getShortenedArrowPath(x1: number, y1: number, x2: number, y2: number, radius: number): string {
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const shortenFactor = length > radius ? 0.95 : 0.9;
    x2 = x1 + shortenFactor * (x2 - x1);
    y2 = y1 + shortenFactor * (y2 - y1);

    return getPath(x1, y1, x2, y2);
}

function getCoordinates(x1: number, y1: number, x2: number, y2: number): PathCoordinates {
    return {start: {x: x1, y: y1}, end: {x: x2, y: y2}};
}

function getPath(x1: number, y1: number, x2: number, y2: number): string {
    const coordinates: PathCoordinates = getCoordinates(x1, y1, x2, y2);

    return `M ${coordinates.start.x}, ${coordinates.start.y}, ${coordinates.end.x}, ${coordinates.end.y}`;
}

interface PathCoordinates {
    start: {x: number, y: number},
    end: {x: number, y: number}
}
interface NodeIdDetails {
    appKey: string,
    type: string,
    schemaName: string
}
