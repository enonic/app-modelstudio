
import * as Q from 'q';
import {ModelItemStatisticsPanel} from '../view/ModelItemStatisticsPanel';
import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {SchemaVisualization} from '../visualization/SchemaVisualization';

export class ModelBrowseItemPanel
    extends BrowseItemPanel {

    schemaVisualization: SchemaVisualization;

    constructor() {
        super();
        this.schemaVisualization = this.createSchemaVisualization();
    }

    createItemStatisticsPanel(): ItemStatisticsPanel {
        return new ModelItemStatisticsPanel();
    }

    createSchemaVisualization(): SchemaVisualization {
        const relations = [
            {
                'source': 'com.enonic.app.superhero',
                'target': 'Content Type'
            },
            {
                'source': 'com.enonic.app.superhero',
                'target': 'Xdata'
            },
            {
                'source': 'com.enonic.app.superhero',
                'target': 'Page'
            },
            {
                'source': 'com.enonic.app.superhero',
                'target': 'Part'
            },
            {
                'source': 'com.enonic.app.superhero',
                'target': 'Layout'
            },
            {
                'source': 'com.enonic.app.superhero',
                'target': 'Mixin'
            },
            {
                'source': 'Content Type',
                'target': 'com.enonic.app.superhero:landing-page'
            },
            {
                'source': 'Content Type',
                'target': 'com.enonic.app.superhero:rss-page'
            },
            {
                'source': 'Content Type',
                'target': 'com.enonic.app.superhero:category'
            },
            {
                'source': 'Content Type',
                'target': 'com.enonic.app.superhero:post'
            },
            {
                'source': 'Content Type',
                'target': 'com.enonic.app.superhero:author'
            },
            {
                'source': 'com.enonic.app.superhero:rss-page',
                'target': 'com.enonic.app.superhero:base:folder'
            },
            {
                'source': 'com.enonic.app.superhero:post',
                'target': 'com.enonic.app.superhero:author'
            },
            {
                'source': 'com.enonic.app.superhero:post',
                'target': 'com.enonic.app.superhero:category'
            },
            {
                'source': 'Xdata',
                'target': 'com.enonic.app.superhero:siteCommon'
            },
            {
                'source': 'Page',
                'target': 'com.enonic.app.superhero:default'
            },
            {
                'source': 'Layout',
                'target': 'com.enonic.app.superhero:one-column'
            },
            {
                'source': 'Layout',
                'target': 'com.enonic.app.superhero:two-column'
            },
            {
                'source': 'Layout',
                'target': 'com.enonic.app.superhero:three-column'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:comment-field'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:search-form'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:faq-list'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:post-single'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:featured'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:recent-posts'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:tag-cloud'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:categories'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:meta'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:archive'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:posts-list'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:search-result'
            },
            {
                'source': 'Part',
                'target': 'com.enonic.app.superhero:latest-comments'
            },
            {
                'source': 'com.enonic.app.superhero:meta',
                'target': 'com.enonic.app.superhero:landing-page'
            },
            {
                'source': 'com.enonic.app.superhero:meta',
                'target': 'com.enonic.app.superhero:post'
            },
            {
                'source': 'com.enonic.app.superhero:meta',
                'target': 'com.enonic.app.superhero:rss-page'
            }
        ];

        return new SchemaVisualization(relations);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.appendChild(this.schemaVisualization);
            return rendered;
        });
    }
}
