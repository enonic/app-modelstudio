package com.enonic.xp.app.visualization.lib;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationWildcardMatcher;
import com.enonic.xp.resource.Resource;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class ApplicationWildcardResolver implements ScriptBean
{

    private Supplier<ResourceService> resourceService;

    public boolean match( final String appKey, final String wildcard, final String test )
    {
        final ApplicationKey applicationKey = ApplicationKey.from( appKey );
        final ApplicationWildcardMatcher<Object> wildcardMatcher = new ApplicationWildcardMatcher<>( applicationKey, Object::toString );
        
        return wildcardMatcher.matches( wildcard, test );
    }

    public List<String> matches_multiple( final String appKey, final String wildcard, final List<String> tests )
    {
        final ApplicationKey applicationKey = ApplicationKey.from( appKey );
        final ApplicationWildcardMatcher<Object> wildcardMatcher = new ApplicationWildcardMatcher<>( applicationKey, Object::toString );

        final List<String> result =
                tests
                .stream()
                .filter( wildcardMatcher.createPredicate( wildcard ) )
                .collect( Collectors.toList() );

        return result;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.resourceService = context.getService( ResourceService.class );
    }
}
