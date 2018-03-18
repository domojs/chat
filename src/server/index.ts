import * as akala from '@akala/server';
import * as vm from 'vm';
import * as url from 'url';
import * as path from 'path';
import * as language from './language'

export = language;

const debug = akala.log('domojs:chat');

var interpreters = [];
akala.register('interpreters', interpreters);

akala.injectWithName(['$master', '$isModule'], function (master: akala.worker.MasterRegistration, ismodule: akala.worker.IsModule)
{
    if (ismodule('@domojs/chat'))
        master(__dirname, './master');

    akala.worker.createClient('chat').then((client) =>
    {
        language.meta.createClient(client)({
            receive: function (interpreter: language.Language)
            {
                
            }
        })
    })
})();
