import * as chat from './language';
import * as akala from '@akala/server';
import { Connection } from '@akala/json-rpc-ws';
import * as ws from 'ws';

var interpreters: Connection[] = [];

@akala.server(chat.meta, { jsonrpcws: true })
class Api
{
    public register(language: chat.Language)
    {
        return akala.when(akala.map(interpreters, (connection) =>
        {
            return akala.api.jsonrpcws(chat.meta).createClientProxy(connection).receive(language);
        })).then(function (values)
        {
            return;
        });
    }

    public registerAsInterpreter(dummy, connection: Connection)
    {
        var connectionIndex = interpreters.push(connection);
        if (connection.socket instanceof ws)
            connection.socket.on('close', function ()
            {
                interpreters.splice(connectionIndex, 1);
            })
    }
}