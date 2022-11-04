import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ButtonEl} from '@enonic/lib-admin-ui/dom/ButtonEl';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {CLASSES, getPhrases} from '../constants';
import {Checkbox, CheckboxBuilder} from '@enonic/lib-admin-ui/ui/Checkbox';
import {BreadcrumbsItem} from '../interfaces';
export class Header extends DivEl{
    private filterInput: InputEl;
    private filterWrapper: DivEl;

    private breadcrumbs: Breadcrumbs;
    private breadcrumbsWrapper: DivEl;

    private referencesCheckbox: Checkbox;
    private referencesWrapper: DivEl;
    
    constructor(className?: string) {
        super('header' + (className ? ' ' + className : ''));
        this.setFilter();
        this.setBreadcrumbs();
        this.setReferences();
    }

    private setFilter() {
        const divEL = new DivEl(CLASSES.filterWrapper);
    
        const inputEL = new InputEl('', 'text');
        inputEL.setPlaceholder(getPhrases().filterPlaceholder);
        inputEL.setClass(CLASSES.filterInput);

        const buttonEL = new ButtonEl();
        const spanEL = new SpanEl(CLASSES.filterIcon);
        buttonEL.appendChild(spanEL);
        buttonEL.hide();

        buttonEL.onClicked(() => inputEL.setValue(''));

        inputEL.onValueChanged(() => {
            if (inputEL.getValue()) {
                buttonEL.setVisible(true);
            } else {
                buttonEL.setVisible(false);
            }
        });

        divEL.appendChild(inputEL);
        divEL.appendChild(buttonEL);

        this.filterInput = inputEL;
        this.filterWrapper = divEL;
    }

    private setBreadcrumbs() {
        const divEL = new DivEl().setClass(CLASSES.breadcrumbsWrapper);
        const breadcrumbs = new Breadcrumbs(CLASSES.breadcrumbs);

        divEL.appendChild(breadcrumbs);

        this.breadcrumbs = breadcrumbs;
        this.breadcrumbsWrapper = divEL;
    }

    private setReferences() {
        const checkbox: Checkbox = <Checkbox>new CheckboxBuilder()
            .setLabelText(getPhrases().referencesLabel)
            .build()
            .setClass(`${CLASSES.referencesInput}`);

        checkbox.getFirstChild().setClass(CLASSES.referencesIcon);

        const divEL = new DivEl()
            .setClass(CLASSES.referencesWrapper)
            .appendChild(checkbox);
        
        this.referencesCheckbox = checkbox;
        this.referencesWrapper = divEL;
    }

    getFilterInput() {
        return this.filterInput;
    }

    getBreadcrumbs() {
        return this.breadcrumbs;
    }

    getReferencesCheckbox() {
        return this.referencesCheckbox;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.filterWrapper);
            this.appendChild(this.breadcrumbsWrapper);
            this.appendChild(this.referencesWrapper);

            return rendered;
        });
    }
}

export class Breadcrumbs extends DivEl {

    constructor(className?: string) {
        super('header' + (className ? ' ' + className : ''));
    }

    update(items: BreadcrumbsItem[], clickHandler: (nodeId: string) => void): void {
        this.getHTMLElement().innerHTML = '';

        const spanElements = items.map(({nodeName, nodeId}, index) =>  {
            let spanEL = new SpanEl();

            spanEL.setHtml(nodeName);

            if (index + 1 < items.length) {
                spanEL.onClicked(() => clickHandler(nodeId));
            }

            return spanEL;
        });

        spanElements.forEach(span => this.appendChild(span));

        this.doRender();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            return rendered;
        });
    }
}