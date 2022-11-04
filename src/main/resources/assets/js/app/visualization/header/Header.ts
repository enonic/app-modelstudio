import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ButtonEl} from '@enonic/lib-admin-ui/dom/ButtonEl';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';
import {LabelEl} from '@enonic/lib-admin-ui/dom/LabelEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {getPhrases} from '../constants';

export default class Header extends DivEl{
    private filterWrapper: DivEl;
    private breadcrumbsWrapper: DivEl;
    private referencesWrapper: DivEl;
    
    constructor(filterInputID: string, breadcrumbsID: string, referencesCheckboxID: string, className?: string) {
        super('header' + (className ? ' ' + className : ''));

        this.setFilterWrapper(filterInputID);
        this.setBreadcrumbsWrapper(breadcrumbsID);
        this.setReferencesWrapper(referencesCheckboxID);
    }

    private setFilterWrapper(filterInputID: string) {
        const divEL = new DivEl('filterWrapper');
    
        const inputEL = new InputEl('', 'text');
        inputEL.setPlaceholder(getPhrases().filterPlaceholder);
        inputEL.setId(filterInputID);

        const buttonEL = new ButtonEl();
        const spanEL = new SpanEl('icon-close');
        buttonEL.appendChild(spanEL);
        buttonEL.hide();

        const clearInput = () => {
            const inputDOM = document.getElementById(inputEL.getId()) as HTMLInputElement;
            inputDOM.value = '';
            inputDOM.dispatchEvent(new KeyboardEvent('keyup', {'key': 'enter'}));
        };

        buttonEL.onClicked(clearInput);

        inputEL.onRendered(() => {
            const inputDOM = document.getElementById(inputEL.getId()) as HTMLInputElement;
            const buttonDOM = document.getElementById(buttonEL.getId()) as HTMLButtonElement;
            
            inputDOM.addEventListener('keyup', (event: Event) => {
                buttonDOM.style.display = (event.target as HTMLInputElement).value ? '' : 'none';
            });
        });

        divEL.appendChild(inputEL);
        divEL.appendChild(buttonEL);

        this.filterWrapper = divEL;
    }

    private setBreadcrumbsWrapper(breadrumbsID: string) {
        this.breadcrumbsWrapper = new DivEl().setId(breadrumbsID);
    }

    private setReferencesWrapper(referencesCheckboxID: string) {
        const divEL = new DivEl().setId('referencesWrapper');
    
        const inputEL = new InputEl('icon-link', 'checkbox');
        inputEL.setId(referencesCheckboxID);
        
        const labelEL = new LabelEl(getPhrases().referencesLabel);
        labelEL.getHTMLElement().setAttribute('for', referencesCheckboxID);
    
        divEL.appendChild(inputEL);
        divEL.appendChild(labelEL);
        
        this.referencesWrapper = divEL;
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
