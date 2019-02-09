import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as vm from 'vm';
import * as url from 'url';
import * as util from 'util';
import './api';
import * as language from './language';
import * as akala from '@akala/server';
import { AssetRegistration } from '@akala-modules/core'
import { Client, Connection } from '@akala/json-rpc-ws';

var debug = akala.log('domojs:chat');

akala.injectWithName(['$master', '$isModule'], function (master: akala.worker.MasterRegistration, isModule: (m: string) => boolean)
{
    if (isModule('@domojs/chat'))
    {
        master(module.filename, './master', './language');
        akala.injectWithNameAsync([AssetRegistration.name, '$agent.api/@domojs/chat'], function (va: AssetRegistration, client: Client<Connection>)
        {
            va.register('/js/routes.js', require.resolve('../routes'));
            va.register('/js/tiles.js', require.resolve('../tile'));

            akala.api.client(language.meta, { jsonrpcws: true })(
                class
                {
                    public receive(language)
                    {
                        console.log(language);
                        require(language.path);
                    }
                });
        })
    }
})();

export { meta, KeywordContext, KeywordInterpreter } from './language';

export type Interpreter = (context: Context, next: (error?: any) => void, callback: (answer: string) => void) => void;

export interface Context
{
    text: string;
    timeStart?: number;
    time?: Date;
    timeEnd?: number;
    deferred?: boolean;
}

akala.register('interpreter',
    function (text: string, callback: (status: number, text: string) => void)
    {
        var ctx = { text: text };
        var interpreters: Interpreter[] = akala.resolve('interpreters');
        akala.eachAsync(interpreters, function (interpreter, idx, next)
        {
            interpreter(ctx, next, function (text: string)
            {
                callback(200, text);
            });
        }, function (error)
            {
                if (error)
                    callback(500, error);
                else
                    callback(200, 'ok');
            })
    });

akala.register('interpreters', []);