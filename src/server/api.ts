import * as akala from '@akala/server';
import * as express from 'express';
import * as language from './language';

akala.injectWithName(['$router'], function (router: akala.worker.Router)
{
    router.all('/api/ask', akala.command(['interpreter', 'query.q', '$callback'], function (interpreter, query: string, callback)
    {
        console.log(query);
        interpreter(query, callback);
    }));
})();