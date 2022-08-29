
import {
    getCleanCentralNodeId,
    getCleanNodeId,
    getColors,
    getFatherNodeId,
    getNodeById,
    getNodeColor,
    getNodeColorByNodeId,
    getNodeIcon,
    getOuterCircleRadius,
    getOuterTextSize,
    getRelationsPathD,
    getSvgNodeId,
    getTextRotation,
    getTextXPosition,
    getTextYPosition
} from './helpers';
import {Relation, Node, RenderGlobalConfig, D3SVG, RenderOption, D3SVGG} from './interfaces';
import {SchemaRenderOptionsBuilder} from './SchemaRenderOptionsBuilder';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';

export default class SchemaRender {
    relations: Relation[];
    nodes: Node[];
    globalConfig: RenderGlobalConfig;
    renderOptions: RenderOption[];
    textsAndIconsSVGGroups: D3SVGG[];
    backArrowSvgGroup: D3SVGG;

    constructor(relations: Relation[], nodes: Node[], node: Node) {
        this.relations = relations;
        this.nodes = nodes;
        this.globalConfig = {
            references: {
                opacity: 0.1,
            },
            text: {
                size: getOuterTextSize(nodes),
            },
            marker: {
                size: 5,
            },
            circle: {
                radius: getOuterCircleRadius(nodes),
                color: 'lightgray',
            },
            classnames: {
                hideOnRef: 'hide-on-ref',
            },
            ids: {
                centralNode: 'CentralNode',
                search: 'SearchInput',
                checkbox: 'ShowReferencesCheckbox',
                breadcrumbs: 'Breadcrumbs',
                backArrow: 'BackArrow',
                references: 'Relations',
                textsAndIcons: 'TextsAndIcons',
                innerCircle: 'InnerSVG',
                outerCircle: 'OuterSVG',
            },
            children: {
                many: 30,
            },
        };

        this.setOptions(node);
    }

    private initListeners(svg: D3SVG) {
        this.initSearchInputListeners();
        this.initShowReferenceCheckboxListeners(svg);
        this.initTextsAndIconsListeners(svg);
        this.initBackArrowListeners(svg);
    }

    private initSearchInputListeners(): void {
        const keyUpHandler = (e: Event) => {
            this.clearAllHoveredGroups();
            
            const typedText = (e.target as HTMLInputElement).value;

            if (!typedText) {
                return;
            }

            const nodeMatches = this.nodes.filter(node => node.id.includes(typedText));

            if (nodeMatches.length === 0) {
                return;
            }

            const svgGroups = nodeMatches.map(node => document.getElementById(node.id)).filter(el => !!el);
            svgGroups.forEach(group => group.classList.add('hover'));
        };

        this.setUniqueListener(this.globalConfig.ids.search, 'keyup', keyUpHandler, 100);
    }

    private initShowReferenceCheckboxListeners(svg: D3SVG) {
        const changeHandler = () => {
            if (this.isInSearchMode()) {
                const typedText = this.getSearchInput().value;
                const nodeIdMatches = this.nodes.filter(node => node.id.includes(typedText)).map(node => node.id);
                this.toggleReferences(svg, nodeIdMatches);
            } else {
                this.toggleReferences(svg);
            }
        };

        this.setUniqueListener(this.globalConfig.ids.checkbox, 'change', changeHandler);
    }

    private initTextsAndIconsListeners(svg: D3SVG) {
        const clickHandler = (_, nodeId: string): void => {
            this.clickHandler(svg, nodeId);
        };

        const mouseOverHandler = (_, nodeId: string): void => {
            if (this.isInSearchMode()) {
                return;
            }

            const conditionals = {
                nodeDepthIsDifferentThanTwo: getNodeById(this.nodes, nodeId).depth !== 2,
                nodeHasReferenceWithSameDepth: this.relations.some(relation => 
                    (relation.source === nodeId || relation.target === nodeId) && 
                    getNodeById(this.nodes, relation.source).depth === getNodeById(this.nodes, relation.target).depth
                )
            };

            if (conditionals.nodeDepthIsDifferentThanTwo && conditionals.nodeHasReferenceWithSameDepth) {
                this.toggleReferences(svg, [], true);
            }

            const pathSelector = `#${this.globalConfig.ids.references} > path`;
            const fnPathElementsOpacity = (relation: Relation) => {
                const opacity = Number(relation.source === nodeId || relation.target === nodeId);
                return opacity || this.globalConfig.references.opacity;
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
            const centralNode = this.renderOptions[this.renderOptions.length - 1].data.node;
            const centralNodeFather = getFatherNodeId(this.relations, this.nodes, centralNode);
            this.clickHandler(svg, centralNodeFather);
        };

        this.backArrowSvgGroup.on('click', clickHandler);
    }

    private toggleReferences(svg: D3SVG, nodeIds: string[] = [], forceToggle: boolean = false) {
        const pathSelector = `#${this.globalConfig.ids.references} > path`;
        const hideSelector = `.${this.globalConfig.classnames.hideOnRef}`;

        const fnPathElementsOpacity = (relation: Relation) => {
            if (this.getShowReferencesCheckbox().checked || forceToggle) {
                if (nodeIds.length > 0) {
                    return Number(nodeIds.some(nodeId => nodeId === relation.source || nodeId === relation.target));
                } else {
                    return 1;
                }
            } else {
                return this.globalConfig.references.opacity;
            }
        };

        const fnHideElementsOpacity = () => {
            if (this.getShowReferencesCheckbox().checked || forceToggle) {
                return this.globalConfig.references.opacity; 
            } else {
                return 1;
            }
        };

        svg.selectAll(pathSelector).attr('opacity', fnPathElementsOpacity);
        svg.selectAll(hideSelector).attr('opacity', fnHideElementsOpacity);
    }

    private clickHandler(svg: D3SVG, nodeId: string): void {
        const node = getNodeById(this.nodes, nodeId);
        this.setOptions(node);
        this.execute(svg);
    }

    public execute(svg: D3SVG) {
        this.reset(svg);
        this.renderOptions.forEach(renderOption => this.renderByOption(svg, renderOption));
        this.setSvgDefs(svg);
        this.updateBreadcrumbs();
        this.toggleReferences(svg);
        this.initListeners(svg);
    }

    private reset(svg: D3SVG) {
        this.textsAndIconsSVGGroups = [];
        this.backArrowSvgGroup = null;
        svg.selectAll('*').remove(); 
    }

    private setOptions(node: Node) {
       this.renderOptions = new SchemaRenderOptionsBuilder(this.globalConfig, this.relations, this.nodes, node).build();
    }

    private renderByOption(svg: D3SVG, option: RenderOption) {
        const svgGroup = svg.append('g').attr('id', option.config.id).attr('class', option.config.class || null);

        this.appendRelations(svgGroup, option);
        this.appendCircle(svgGroup, option.config.circle.radius);
        this.appendChildrenNodes(svgGroup, svg, option);
        this.appendCentralNode(svgGroup, svg, option);
    }

    private appendTextAndIcons(svgGroup: D3SVGG, option: RenderOption): void {
        const data = option.data.childrenIds;
        const textFontSize = option.config.text.size;

        const group: D3SVGG = svgGroup.append('g')
            .attr('id', this.globalConfig.ids.textsAndIcons)
            .selectAll('text, g')
            .data(data)
            .enter()
            .append('g')
            .attr('id', getSvgNodeId)
            .attr('class', this.tooManyChildren(option) ? 'fade-in' : 'clickable-group fade-in');

        const textFunctions = this.getTextFunctions(option);

        if (!this.tooManyChildren(option)) {
            const imageFunctions = this.getImageFunctions(option);
            const rectFunctions = this.getRectFunctions(textFunctions, imageFunctions, option);

            this.appendRectWithFunctions(group, rectFunctions);
            this.appendImageWithFunctions(group, imageFunctions);
        }

        this.appendTextWithFunctions(group, textFunctions, textFontSize);

        this.textsAndIconsSVGGroups = [...this.textsAndIconsSVGGroups, group];
    }

    private updateBreadcrumbs() {
        const lastRenderOption = this.renderOptions[this.renderOptions.length - 1];

        
        if (lastRenderOption.data.node) {
            const nodeId = lastRenderOption.data.node.id;
            this.getBreadcrumbs().innerHTML = this.getBreadcrumbsText(nodeId);
        } else {
            this.getBreadcrumbs().innerHTML = '';
        }
    }

    private appendCentralNode(svgGroup: D3SVGG, svg: D3SVG, option: RenderOption) {
        if (!option.data.node) { return; }

        const hideClass = option.data.node.depth > 1 ? this.globalConfig.classnames.hideOnRef : null;

        const group = svgGroup.append('g').attr('id', this.globalConfig.ids.centralNode);

        const icon = getNodeIcon(this.relations, this.nodes, option.data.node.id);
        
        if (icon) {
            const width = 40;
            const x = - width / 2;
            const y = - width / 1.5;

            this.appendImage(group, icon, width, x, y).attr('class', hideClass);
        }

        this.appendNodeName(group, option).attr('class', hideClass);

        if (option.data.techAppName) {
            this.appendTechAppName(group, option).attr('class', hideClass);
        }

        if (option.data.node.depth > 1) {
            this.appendBackArrow(group, option.config.text.size).attr('class', hideClass);
        }
    }

    private appendNodeName(svg: D3SVGG, option: RenderOption) {
        const size = 1.5 * option.config.text.size;
        const text = getCleanCentralNodeId(option.data.node.id);
        const x = 0;
        const y = getNodeIcon(this.relations, this.nodes, option.data.node.id) ? 40 / 1.25 : 0;
        return this.appendText(svg, size, text, x, y);
    }

    private appendTechAppName(svg: D3SVGG, option: RenderOption) {
        const size = 7;
        const x = 0;
        const y = getNodeIcon(this.relations, this.nodes, option.data.node.id) ? 40 : 10;
        return this.appendText(svg, size, option.data.techAppName, x, y);
    }

    private appendRelations(svg: D3SVGG, option: RenderOption) {
        if (option.data.relations.length === 0) {
            return;
        }

        const shorten = option.data.node ? 40 : 20;
        const fnD = (relation: Relation) =>
            getRelationsPathD(relation, option.data.childrenIds, option.config.circle.radius, shorten);

        const fnStroke = (relation: Relation) =>
            getNodeColor(this.relations, this.nodes, getNodeById(this.nodes, relation.source));

        const linkGroups = svg.append('g')
            .attr('id', this.globalConfig.ids.references)
            .selectAll('path')
            .data(option.data.relations)
            .enter();

        const markerEnd = (id: string) => `#arrow-${getNodeColorByNodeId(this.relations, this.nodes, id)}`;

        return linkGroups.append('path')
            .attr('d', fnD)
            .attr('stroke', fnStroke)
            .attr('stroke-dasharray', d => d.dash ? 6 : null)
            .attr('marker-end', d => `url(${markerEnd(d.source)})`);
    }

    private appendImage(svg: D3SVGG, href: string, width: number, x = 0, y = 0) {
        svg.append('rect').attr('x', x - 5).attr('y', y - 5).attr('width', width + 10).attr('height', width + 10).attr('fill', 'white');
        return svg.append('image').attr('x', x).attr('y', y).attr('width', width).attr('href', href);
    }

    private appendText(svg: D3SVGG, size: number, text: string, x = 0, y = 0) {
        return svg.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('font-size', size)
            .attr('text-anchor', 'middle')
            .text(text);
    }

    private appendCircle(svg: D3SVGG, radius: number, x = 0, y = 0) {
        return svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', this.globalConfig.circle.color);
    }

    private appendChildrenNodes(svgGroup: D3SVGG, svg: D3SVG, option: RenderOption) {
        if (!option.data.childrenIds.length) { return; }

        this.appendTextAndIcons(svgGroup, option);
    }

    private appendTextWithFunctions(svg: D3SVGG, functions: ReturnType<typeof this.getTextFunctions>, textFontSize: number) {
        svg.append('text')
            .attr('x', functions.x)
            .attr('y', functions.y)
            .attr('fill', functions.fill)
            .attr('font-size', textFontSize)
            .attr('text-anchor', 'middle')
            .attr('transform', functions.transform)
            .text(functions.text)
            .clone(true).lower()
            .attr('stroke', 'white')
            .attr('stroke-width', textFontSize);
    }

    private appendRectWithFunctions(svg: D3SVGG, functions: ReturnType<typeof this.getRectFunctions>) {
        svg.append('rect')
            .attr('x', functions.x)
            .attr('y', functions.y)
            .attr('width', functions.width)
            .attr('height', functions.height)
            .attr('fill', functions.fill);
    }

    private appendImageWithFunctions(svg: D3SVGG, functions: ReturnType<typeof this.getImageFunctions>) {
        svg.append('image')
            .attr('x', functions.x)
            .attr('y', functions.y)
            .attr('width', functions.width)
            .attr('href', functions.href);
    }

    private appendBackArrow(svg: D3SVGG, size: number, fnClickHandler = () => { }): D3SVGG {
        const group: D3SVGG = svg.append('g')
            .attr('id', this.globalConfig.ids.backArrow)
            .attr('class', 'clickable-group');
        
        group.append('path')
            .attr('class', 'back-arrow')
            // eslint-disable-next-line max-len
            .attr('d', `M0 ${2 * size + 200} l-10-10c-0.781-0.781-0.781-2.047 0-2.828l10-10c0.781-0.781 2.047-0.781 2.828 0s0.781 2.047 0 2.828l-6.586 6.586h19.172c1.105 0 2 0.895 2 2s-0.895 2-2 2h-19.172l6.586 6.586c0.39 0.39 0.586 0.902 0.586 1.414s-0.195 1.024-0.586 1.414c-0.781 0.781-2.047 0.781-2.828 0z`)
            .attr('transform', 'scale(0.25)')
            .attr('pointer-events', 'none');

        group.append('rect')
            .on('click', fnClickHandler)
            .attr('x', -10)
            .attr('y', 45)
            .attr('width', 20)
            .attr('height', 15)
            .attr('opacity', 0);

        this.backArrowSvgGroup = group;

        return this.backArrowSvgGroup;
    }

    private setSvgDefs(svg: D3SVG): void {
        svg.append('defs')
            .selectAll('marker')
            .data(getColors())
            .join('marker')
            .attr('id', color => `arrow-${color}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('markerWidth', this.globalConfig.marker.size)
            .attr('markerHeight', this.globalConfig.marker.size)
            .attr('orient', 'auto')
            .append('path')
            .attr('fill', color => color)
            .attr('d', 'M0,-5L10,0L0,5');
    }

    private tooManyChildren(option: RenderOption): boolean {
        return option.data.childrenIds.length >= this.globalConfig.children.many;
    }

    private clearAllHoveredGroups(): void {
        const hoveredGroups = document.querySelectorAll('g .hover');
        hoveredGroups.forEach(group => group.classList.remove('hover'));
    }

    private getBreadcrumbsText(nodeId: string): string {
        const recur = (nodeId: string, ids = []) => {
            const fatherNodeId = getFatherNodeId(this.relations, this.nodes, getNodeById(this.nodes, nodeId));
            return fatherNodeId ? recur(fatherNodeId, [nodeId, ...ids]) : [nodeId, ...ids];
        };
        return recur(nodeId).filter((id: string) => !!id).map(getCleanCentralNodeId).join(' > ');
    }

    private getTextFunctions(option: RenderOption) {
        const fnTextX = (_, nodeIndex: number) =>
            getTextXPosition(nodeIndex, option.config.circle.radius, option.data.childrenIds.length);

        const fnTextY = (_, nodeIndex: number) =>
            getTextYPosition(nodeIndex, option.config.circle.radius, option.data.childrenIds.length);

        const fnTextFill = (nodeId: string) => getNodeColor(this.relations, this.nodes, getNodeById(this.nodes, nodeId));

        const fnText = (nodeId: string) => getCleanNodeId(nodeId);

        const fnTextTransform = (_, nodeIndex: number) => this.tooManyChildren(option)
            ? getTextRotation(nodeIndex, option.data.childrenIds.length, option.config.circle.radius)
            : null;

        return {
            x: fnTextX,
            y: fnTextY,
            fill: fnTextFill,
            text: fnText,
            transform: fnTextTransform
        };
    }

    private getImageFunctions(option: RenderOption) {
        const fnImageX = (nodeId: string, nodeIndex: number) =>
            getTextXPosition(nodeIndex, option.config.circle.radius, option.data.childrenIds.length) -
            fnImageWidth(nodeId) / 2;

        const fnImageY = (nodeId: string, nodeIndex: number) =>
            getTextYPosition(nodeIndex, option.config.circle.radius, option.data.childrenIds.length) -
            fnImageWidth(nodeId) - 1.75 * this.globalConfig.text.size;

        const fnImageWidth = (nodeId: string) =>
            getNodeById(this.nodes, nodeId).depth === 3 ? 15 / 2 : 15;

        const fnImageHref = (nodeId: string) =>
            getNodeIcon(this.relations, this.nodes, nodeId) ||
            getNodeIcon(
                this.relations,
                this.nodes,
                getFatherNodeId(this.relations, this.nodes, getNodeById(this.nodes, nodeId))
            );

        return {
            x: fnImageX,
            y: fnImageY,
            width: fnImageWidth,
            height: fnImageWidth,
            href: fnImageHref
        };
    }

    private getRectFunctions(textFunctions: ReturnType<typeof this.getTextFunctions>,
        imageFunctions: ReturnType<typeof this.getImageFunctions>,
        option: RenderOption) {

        const padding = {top: 5, right: 0, bottom: option.config.text.size === this.globalConfig.text.size ? 10 : 0, left: 0};

        const fnRectWidth = (nodeId: string) =>
            textFunctions.text(nodeId).length / 1.5 * option.config.text.size + padding.left + padding.right;

        const fnRectHeight = (nodeId: string) =>
            imageFunctions.height(nodeId) + option.config.text.size * 1.5 + padding.top + padding.bottom;

        const fnRectX = (nodeId: string, nodeIndex: number) =>
            textFunctions.x(nodeId, nodeIndex) - fnRectWidth(nodeId) / 2 - padding.left;

        const fnRectY = (nodeId: string, nodeIndex: number) =>
            imageFunctions.y(nodeId, nodeIndex) - padding.top;

        const fnRectFill = (nodeId: string) => getNodeColor(this.relations, this.nodes, getNodeById(this.nodes, nodeId));

        return {
            x: fnRectX,
            y: fnRectY,
            width: fnRectWidth,
            height: fnRectHeight,
            fill: fnRectFill,
        };
    }

    private getSearchInput(): HTMLInputElement {
        return document.getElementById(this.globalConfig.ids.search) as HTMLInputElement;
    }

    private getShowReferencesCheckbox(): HTMLInputElement {
        return document.getElementById(this.globalConfig.ids.checkbox) as HTMLInputElement;
    }

    private getBreadcrumbs(): HTMLInputElement {
        return document.getElementById(this.globalConfig.ids.breadcrumbs) as HTMLInputElement;
    }

    private isInSearchMode(): boolean {
        return Boolean(this.getSearchInput().value !== '');
    }

    private setUniqueListener(elementId: string, listenerType: string, fnHandler: (e: Event) => void, debounceTime: number = 0): void {
        const element: HTMLElement = document.getElementById(elementId);

        if (element) {
            const handler = AppHelper.debounce(fnHandler, debounceTime);
            element.replaceWith(element.cloneNode(true));
            document.getElementById(elementId).addEventListener(listenerType, handler);
        }
    }
}