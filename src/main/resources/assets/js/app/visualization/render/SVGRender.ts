
import {
    getFatherNodeId,
    getNodeById,
    getNodeColor,
    getNodeColorByNodeId,
    getRelationsPath,
    getSvgNodeId,
    getTextRotation,
    getTextXPosition,
    getTextYPosition,
    getTextWidth,
    getDepth,
    getOuterCircleRadius,
    getOuterTextSize,
    setUniqueListener,
    getAscendantNodeIds,
    getRelationsFromSource,
} from '../helpers';
import {Relation, Node, RenderConfig, D3SVG, RenderOption, D3SVGG, FnSchemaNavigationListener} from '../interfaces';
import {SVGRenderOptionsBuilder} from './SVGRenderOptionsBuilder';
import {CLASSES, getRenderConfig} from '../constants';
import {Breadcrumbs, Header} from '../header/Header';
import {Checkbox} from '@enonic/lib-admin-ui/ui/Checkbox';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';

export class SVGRender {
    private relations: Relation[];
    private nodes: Node[];
    private config: RenderConfig;
    private circleRadius: number;
    private textSize: number;
    private renderOptions: RenderOption[];
    private header: Header;
    private breadcrumbsInfo: {nodeName: string, nodeId: string}[] = [];
    private onNavigationListeners: FnSchemaNavigationListener[] = [];
    private svg: D3SVG;
    private textsAndIconsSVGGroups: D3SVGG[];
    private backArrowSvgGroup: D3SVGG;

    private static readonly centralNodeID = 'central-node';
    private static readonly backArrowID = 'back-arrow';
    private static readonly textsAndIconsID = 'texts-and-icons';
    private static readonly referencesID = 'references';

    constructor(relations: Relation[], nodes: Node[], node: Node, header: Header) {
        this.relations = relations;
        this.nodes = nodes;
        this.header = header;
        this.config = getRenderConfig();

        this.circleRadius = getOuterCircleRadius(nodes);
        this.textSize = getOuterTextSize(nodes);

        this.setOptions(node);
    }

    private initListeners(svg: D3SVG) {
        this.initFilterInputListeners();
        this.initShowReferenceCheckboxListeners(svg);
        this.initTextsAndIconsListeners(svg);
        this.initBackArrowListeners(svg);
    }

    private initFilterInputListeners(): void {
        const changeHandler = () => {
            this.clearAllHoveredGroups();

            const typedText = this.getFilterInput().getValue();

            if (!typedText) {
                return;
            }

            const nodeIdMatches = this.nodes
                .map(node => node.id)
                .filter(nodeId => getDepth(this.relations, nodeId) === 3 && nodeId.toLowerCase().includes(typedText.toLowerCase()));

            if (nodeIdMatches.length === 0) {
                return;
            }

            const svgGroups = nodeIdMatches.map(nodeId => document.getElementById(nodeId.toLowerCase())).filter(el => !!el);
            svgGroups.forEach(group => group.classList.add('filtered'));
        };

        setUniqueListener(this.getFilterInput(), 'onValueChanged', changeHandler, 100);
    }

    private initShowReferenceCheckboxListeners(svg: D3SVG) {
        const changeHandler = () => {            
            if (this.isInSearchMode()) {
                const typedText = this.getFilterInput().getValue();
                const nodeIdMatches = this.nodes.filter(node => node.id.includes(typedText)).map(node => node.id);
                this.toggleReferences(svg, nodeIdMatches);
            } else {
                this.toggleReferences(svg);
            }
        };

        setUniqueListener(this.getReferencesCheckbox(), 'onChange', changeHandler);
    }

    private initTextsAndIconsListeners(svg: D3SVG) {
        const clickHandler = (_, nodeId: string) => {
            const nodeIdToCollapse = (this.breadcrumbsInfo[1] || {}).nodeId !== getAscendantNodeIds(this.relations, this.nodes, nodeId)[1]
                ? (this.breadcrumbsInfo[1] || {}).nodeId
                : undefined;

            this.clickHandler(svg, nodeId, nodeIdToCollapse);
        };
        
        const mouseOverHandler = (_, nodeId: string): void => {
            if (this.isInSearchMode()) {
                return;
            }

            const node = getNodeById(this.nodes, nodeId);

            // Hovering children if father is of depth 2
            if (node.depth === 2) {
                const svgGroups = getRelationsFromSource(this.relations, node.id)
                    .map(({target}) => document.getElementById(getSvgNodeId(target)))
                    .filter(el => !!el);

                svgGroups.forEach(group => group.classList.add('hover'));
            }

            // Showing connected references
            const conditionals = {
                isShowingAllRelations: this.renderOptions.length > 1,
                nodeDepthIsDifferentThanTwo: getNodeById(this.nodes, nodeId).depth !== 2,
                nodeHasReferenceWithSameDepth: this.relations.some(relation =>
                    (relation.source === nodeId || relation.target === nodeId) &&
                    getNodeById(this.nodes, relation.source).depth === getNodeById(this.nodes, relation.target).depth
                ),
                nodeHasReferenceWithSameFather: this.relations.some(relation =>
                    (relation.source === nodeId || relation.target === nodeId) &&
                    getFatherNodeId(this.relations, this.nodes, getNodeById(this.nodes, relation.source)) ===
                    getFatherNodeId(this.relations, this.nodes, getNodeById(this.nodes, relation.target))
                )
            };

            if (conditionals.nodeDepthIsDifferentThanTwo
                && conditionals.nodeHasReferenceWithSameDepth
                && (conditionals.isShowingAllRelations || conditionals.nodeHasReferenceWithSameFather)) {
                this.toggleReferences(svg, [], true);
            }

            const pathSelector = `#${SVGRender.referencesID} > path`;
            const fnPathElementsOpacity = (relation: Relation) => {
                const opacity = Number(relation.source === nodeId || relation.target === nodeId);
                return opacity || this.config.references.opacity;
            };
            svg.selectAll(pathSelector).attr('opacity', fnPathElementsOpacity);
        };

        const mouseOutHandler = (): void => {
            if (this.isInSearchMode()) {
                return;
            }

            this.clearAllHoveredGroups();
            this.toggleReferences(svg);
        };

        this.textsAndIconsSVGGroups.forEach(group => {
            group.on('click', clickHandler);
            group.on('mouseover', mouseOverHandler);
            group.on('mouseout', mouseOutHandler);
        });
    }

    private initBackArrowListeners(svg: D3SVG) {
        if (!this.backArrowSvgGroup) {
            return;
        }

        const clickHandler = () => {
            const centralNode = this.renderOptions[0].data.node;
            const centralNodeFatherId = getFatherNodeId(this.relations, this.nodes, centralNode);
            this.clickHandler(svg, centralNodeFatherId, centralNode.id);
        };

        this.backArrowSvgGroup.on('click', clickHandler);
    }

    private toggleReferences(svg: D3SVG, nodeIds: string[] = [], forceToggle: boolean = false) {
        const pathSelector = `#${SVGRender.referencesID} > path`;
        const hideSelector = `.${CLASSES.hideOnRef}`;

        const fnPathElementsOpacity = (relation: Relation) => {
            if (this.isInReferencesMode() || forceToggle) {
                if (nodeIds.length > 0) {
                    return Number(nodeIds.some(nodeId => nodeId === relation.source || nodeId === relation.target));
                } else {
                    return 1;
                }
            } else {
                return this.config.references.opacity;
            }
        };

        const fnHideElementsOpacity = () => {
            if (this.isInReferencesMode() || forceToggle) {
                return this.config.references.opacity;
            } else {
                return 1;
            }
        };

        svg.selectAll(pathSelector).attr('opacity', fnPathElementsOpacity);
        svg.selectAll(hideSelector).attr('opacity', fnHideElementsOpacity);
    }

    private updateReferencesCheckboxState() {
        const referencesCheckbox = this.getReferencesCheckbox();
        const renderRelations = this.renderOptions.reduce((prev, option) => prev.concat(option.data.relations), []);
            
        if (renderRelations.length === 0) {
            referencesCheckbox.setChecked(false);
            referencesCheckbox.setEnabled(false);
        } else {
            referencesCheckbox.setEnabled(true);
        }
    }

    private clickHandler(svg: D3SVG, nodeId: string, nodeIdToCollapse?: string): void {
        const node = getNodeById(this.nodes, nodeId);
        
        if (node && node.clickable) {
            this.executeOnNavigationListeners(nodeId, nodeIdToCollapse);
            this.setOptions(node);
            this.execute(svg);
        }
    }

    navigateToNode(nodeId: string): void {
        if (this.svg && getNodeById(this.nodes, nodeId)) {
            this.clickHandler(this.svg, nodeId);
        }
    }

    execute(svg: D3SVG) {
        this.svg = svg;

        this.reset(svg);
        this.renderOptions.forEach(renderOption => this.renderByOption(svg, renderOption));
        this.setSvgDefs(svg);
        this.toggleReferences(svg);
        this.initListeners(svg);
        this.updateBreadcrumbs(svg);
        this.updateReferencesCheckboxState();
    }

    appendNavigationListeners(fn: FnSchemaNavigationListener) {
        this.onNavigationListeners = [fn, ...this.onNavigationListeners];
    }

    private executeOnNavigationListeners(nodeId: string, nodeIdToCollapse?: string) {
        const node = getNodeById(this.nodes, nodeId);

        if (node && node.clickable) {
            const arr = getAscendantNodeIds(this.relations, this.nodes, nodeId);
            this.onNavigationListeners.forEach(listener => listener(arr, nodeIdToCollapse));
        }
    }

    private reset(svg: D3SVG) {
        this.getFilterInput().setValue('');
        this.textsAndIconsSVGGroups = [];
        this.backArrowSvgGroup = null;
        svg.selectAll('*').remove();
    }

    private setOptions(node: Node) {
        this.renderOptions = new SVGRenderOptionsBuilder(
            {
                circleRadius: this.circleRadius,
                textSize: this.textSize
            }, 
            this.relations, 
            this.nodes, 
            node
        ).build();
    }

    private renderByOption(svg: D3SVG, option: RenderOption) {
        const svgGroup = svg.append('g').attr('id', option.config.id).attr('class', option.config.class || null);

        this.appendRelations(svgGroup, option);
        this.appendCircle(svgGroup, option.config.circle.radius);
        this.appendChildrenNodes(svgGroup, option);
        this.appendCentralNode(svgGroup, option);
    }

    private appendTextAndIcons(svgGroup: D3SVGG, option: RenderOption): void {
        const data = option.data.childrenIdsToShow;

        const textFontSize = option.config.text.size;
        const textFunctions = this.getTextFunctions(option, data.length);
        const rectHoverFunctions = this.getRectFunctions(textFunctions, option);
        const whiteRectFunctions = this.getRectFunctions(textFunctions, option, 'white');

        const group: D3SVGG = svgGroup.append('g')
            .attr('id', SVGRender.textsAndIconsID)
            .selectAll('text, g')
            .data(data)
            .enter()
            .append('g')
            .attr('id', getSvgNodeId)
            .attr('class', 'fade-in')
            .attr('transform', textFunctions.transform);

        this.appendRectWithFunctions(group, rectHoverFunctions);
        this.appendRectWithFunctions(group, whiteRectFunctions);
        this.appendTextWithFunctions(group, textFunctions, textFontSize);
        this.appendTitleToDepth3Nodes(group, data);
        
        this.textsAndIconsSVGGroups = [...this.textsAndIconsSVGGroups, group];
    }

    private appendCentralNode(svgGroup: D3SVGG, option: RenderOption) {
        if (!option.data.node) { return; }

        const hideClass = option.data.node && option.data.node.depth < 3 ? CLASSES.hideOnRef : null;
        const group = svgGroup.append('g').attr('id', SVGRender.centralNodeID).attr('class', hideClass);
        const icon = option.data.node.icon;

        if (icon) {
            const width = 50;
            const height = 50;
            const x = - width / 2;
            const y = - width * 1.2;

            this.appendImage(group, icon, width, height, x, y);
        }

        this.appendNodeName(group, option);
        this.appendTechAppName(group, option);
        this.appendBackArrow(svgGroup, option);
    }

    private appendNodeName(svg: D3SVGG, option: RenderOption) {
        const size = 1.1 * option.config.text.size;
        let text = option.data.node.displayName;
        const [x, y] = [0, option.data.node.icon ? 40 / 2.5 : 0]; // TODO: use width
        return this.appendText(svg, size, text, x, y, this.config.colors.primary);
    }

    private appendTechAppName(svg: D3SVGG, option: RenderOption) {
        const size = 7;
        const [x, y] = [0, option.data.node.icon ? 40 / 1.25 : 45]; // TODO: use width
        return this.appendText(svg, size, option.data.node.key, x, y, this.config.colors.secondary);
    }

    private appendRelations(svg: D3SVGG, option: RenderOption) {
        if (option.data.relations.length === 0) {
            return;
        }

        const fnD = (relation: Relation) => getRelationsPath(relation, option, this.tooManyChildren(option));

        const fnStroke = (relation: Relation) =>
            getNodeColor(this.relations, this.nodes, getNodeById(this.nodes, relation.source), this.config.colors.range);

        const fnDash = (relation: Relation) => relation.dash ? 6 : null;

        const fnTransform = (relation: Relation) => this.tooManyChildren(option) && relation.target === relation.source 
            ? getTextRotation(
                option.data.childrenIdsToShow.findIndex(nodeId => nodeId === relation.target), 
                option.data.childrenIdsToShow.length, 
                option.config.circle.radius,
            ) : null;

        const markerEnd = (relation: Relation) => 
            `url(#arrow-${getNodeColorByNodeId(this.relations, this.nodes, relation.source, this.config.colors.range)})`;

        const linkGroups = svg.append('g')
            .attr('id', SVGRender.referencesID)
            .selectAll('path')
            .data(option.data.relations)
            .enter();

        return linkGroups.append('path')
            .attr('d', fnD)
            .attr('fill', 'none')
            .attr('stroke', fnStroke)
            .attr('stroke-dasharray', fnDash)
            .attr('marker-end', markerEnd)
            .attr('transform', fnTransform);
    }

    private appendImage(svg: D3SVGG, href: string, width: number, height: number, x = 0, y = 0) {
        svg.append('rect').attr('x', x - 5).attr('y', y - 5).attr('width', width + 10).attr('height', height + 10).attr('fill', 'white');
        return svg.append('image').attr('x', x).attr('y', y).attr('width', width).attr('height', height).attr('href', href);
    }

    private appendText(svg: D3SVGG, size: number, text: string, x = 0, y = 0, color: string = 'black') {
        return svg.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('font-size', size)
            .attr('text-anchor', 'middle')
            .attr('fill', color)
            .text(text);
    }

    private appendCircle(svg: D3SVGG, radius: number, x = 0, y = 0) {
        return svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', this.config.colors.fallback);
    }

    private appendChildrenNodes(svgGroup: D3SVGG, option: RenderOption) {
        if (!option.data.childrenIds.length) { return; }

        this.appendTextAndIcons(svgGroup, option);
    }

    private appendTitleToDepth3Nodes(svg: D3SVGG, childrenIds: string[]) {
        const title = (nodeId: string) => getNodeById(this.nodes, nodeId).depth === 3 
            ? getNodeById(this.nodes, nodeId).key || nodeId.replace(/(.*?)\//g,'')
            : '';

        svg.append('title')
            .data(childrenIds)
            .text(title);
    }

    private appendTextWithFunctions(svg: D3SVGG, functions: ReturnType<typeof this.getTextFunctions>, textFontSize: number) {
        svg.append('text')
            .attr('x', functions.x)
            .attr('y', functions.y)
            .attr('fill', functions.fill)
            .attr('font-size', textFontSize)
            .attr('text-anchor', 'middle')
            .text(functions.text);
    }

    private appendRectWithFunctions(svg: D3SVGG, functions: ReturnType<typeof this.getRectFunctions>) {
        svg.append('rect')
            .attr('x', functions.x)
            .attr('y', functions.y)
            .attr('width', functions.width)
            .attr('height', functions.height)
            .attr('fill', functions.fill);
    }

    private appendBackArrow(svg: D3SVGG, option: RenderOption): D3SVGG {
        if (option.data.node.depth < 2) {
           return;
        }

        const size = option.config.text.size;

        const group: D3SVGG = svg.append('g')
            .attr('id', SVGRender.backArrowID);

        group.append('path')
            .attr('class', 'back-arrow')
            // eslint-disable-next-line max-len
            .attr('d', `M0 ${4 * size + 100} l-10-10c-0.781-0.781-0.781-2.047 0-2.828l10-10c0.781-0.781 2.047-0.781 2.828 0s0.781 2.047 0 2.828l-6.586 6.586h19.172c1.105 0 2 0.895 2 2s-0.895 2-2 2h-19.172l6.586 6.586c0.39 0.39 0.586 0.902 0.586 1.414s-0.195 1.024-0.586 1.414c-0.781 0.781-2.047 0.781-2.828 0z`)
            .attr('transform', 'scale(0.4)')
            .attr('pointer-events', 'none');

        group.append('rect')
            .attr('x', -10)
            .attr('y', 3 * size)
            .attr('width', 20)
            .attr('height', 15)
            .attr('opacity', 0);

        const centralNode = this.renderOptions[0].data.node;
        const centralNodeFatherId = getFatherNodeId(this.relations, this.nodes, centralNode);
        const centralNodeFatherName = getNodeById(this.nodes, centralNodeFatherId).displayName;
        
        group.append('title').text(`${this.config.phrases.navigateBack} ${centralNodeFatherName}`);

        this.backArrowSvgGroup = group;

        return this.backArrowSvgGroup;
    }

    private setSvgDefs(svg: D3SVG): void {
        svg.append('defs')
            .selectAll('marker')
            .data(this.config.colors.range)
            .join('marker')
            .attr('id', color => `arrow-${color}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('markerWidth', this.config.marker.size)
            .attr('markerHeight', this.config.marker.size)
            .attr('orient', 'auto')
            .append('path')
            .attr('fill', color => color)
            .attr('d', 'M0,-5L10,0L0,5');
    }

    private tooManyChildren(option: RenderOption): boolean {
        return option.data.childrenIds.length >= this.config.children.many;
    }

    private clearAllHoveredGroups(): void {
        const hoveredGroups = document.querySelectorAll('g .filtered, g .hover');
        hoveredGroups.forEach(group => group.classList.remove('filtered', 'hover'));
    }
    
    setBreadcrumbsInfo() {
        const firstRenderOption: RenderOption = this.renderOptions[0];
        const centralNode: Node = firstRenderOption.data.node;

        const nodeIds: string[] = getAscendantNodeIds(this.relations, this.nodes, centralNode.id);

        this.breadcrumbsInfo = nodeIds.map((nodeId: string) => {
            const node = getNodeById(this.nodes, nodeId);
            
            return {
                nodeName: node.displayName,
                nodeId: node.id
            };
        });
    }

    private updateBreadcrumbs(svg: D3SVG) {
        this.setBreadcrumbsInfo();

        const clickHandler = (nodeId: string) => {
            const nodeIdToCollapseIndex = this.breadcrumbsInfo.findIndex(info => nodeId === info.nodeId) + 1;
            const nodeIdToCollapse = nodeIdToCollapseIndex < this.breadcrumbsInfo.length 
                ? this.breadcrumbsInfo[nodeIdToCollapseIndex].nodeId
                : undefined;
        
            this.clickHandler(svg, nodeId, nodeIdToCollapse);
        };

        this.getBreadcrumbs().update(this.breadcrumbsInfo, clickHandler);
    }

    private getTextFunctions(option: RenderOption, childrenIdsLength: number) {        
        const fnTextX = (_, nodeIndex: number) =>
            getTextXPosition(nodeIndex, option.config.circle.radius, childrenIdsLength);

        const fnTextY = (_, nodeIndex: number) =>
            getTextYPosition(nodeIndex, option.config.circle.radius, childrenIdsLength);

        const colorsRange = this.config.colors.range;
        const fnTextFill = (nodeId: string) => getNodeColor(this.relations, this.nodes, getNodeById(this.nodes, nodeId), colorsRange);

        const fnText = (nodeId: string) => getNodeById(this.nodes, nodeId).displayName;

        const fnTextTransform = (_, nodeIndex: number) => this.tooManyChildren(option)
            ? getTextRotation(nodeIndex, childrenIdsLength, option.config.circle.radius)
            : null;

        return {
            x: fnTextX,
            y: fnTextY,
            fill: fnTextFill,
            text: fnText,
            transform: fnTextTransform
        };
    }

    private getRectFunctions(textFunctions: ReturnType<typeof this.getTextFunctions>, option: RenderOption, fill?: string) {
        const padding = {
            top: 7.5,
            bottom: 5,
            left: 7.5,
            right: 7.5,
        };

        const fnTextWidth = (nodeId: string) => getTextWidth(textFunctions.text(nodeId), option.config.text.size);

        const fnRectWidth = (nodeId: string) => fnTextWidth(nodeId);
        const fnRectHeight = () => option.config.text.size;

        const fnRectX = (nodeId: string, nodeIndex: number) => textFunctions.x(nodeId, nodeIndex) - fnRectWidth(nodeId) / 2;
        const fnRectY = (nodeId: string, nodeIndex: number) => textFunctions.y(nodeId, nodeIndex) - fnRectHeight() / 2;

        const fnRectFill = () => fill || this.config.colors.secondary;

        return {
            x: (nodeId: string, nodeIndex: number) => fnRectX(nodeId, nodeIndex) - padding.left,
            y: (nodeId: string, nodeIndex: number) => fnRectY(nodeId, nodeIndex) - padding.top,
            width: (nodeId: string) => fnRectWidth(nodeId) + 2 * padding.right,
            height: () => fnRectHeight() + 2 * padding.bottom,
            fill: fnRectFill,
        };
    }

    private getFilterInput(): InputEl {
        return this.header.getFilterInput();
    }

    private getBreadcrumbs(): Breadcrumbs {
        return this.header.getBreadcrumbs();
    }

    private getReferencesCheckbox(): Checkbox {
        return this.header.getReferencesCheckbox();
    }

    private isInSearchMode(): boolean {
        return this.getFilterInput().getValue() !== '';
    }

    private isInReferencesMode(): boolean {
        return this.getReferencesCheckbox().isChecked();
    }
}