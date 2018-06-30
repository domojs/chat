import * as debug from 'debug';
import { EventEmitter } from 'events';
import * as fs from 'fs';
// import * as eachAsync from 'each-async';
import * as path from 'path';
import * as akala from '@akala/server';
import { Api, Proxy } from '@akala/server';
import { Connection } from '@akala/json-rpc-ws';

var log = debug('domojs:chat');

export var meta = new akala.Api()
    .serverToClientOneWay<Language>()({ receive: true })
    .clientToServerOneWay<Language>()({ register: true, registerAsInterpreter: true })

export interface Language
{
    path: string;
    name: string;
}

export type Interpreter = (context: Context, next: (error?: any) => void, callback: (answer: string) => void) => void;

export interface Context
{
    text: string;
    deferred?: boolean;
}

export interface KeywordContext extends Context
{
    action: string;
    keyword: string;
    other: string;
}

export interface Map<V>
{
    [key: string]: V;
}

export abstract class KeywordInterpreter
{
    constructor() { }

    public findInfo(collection: Map<string[]>, text: string)
    {
        log(collection);
        if (collection)
        {
            for (var item in collection)
            {
                log(item);
                for (var syno of collection[item])
                {
                    log(syno);
                    if (text.indexOf(syno) >= 0)
                        return item;
                }
            }
        }
    };

    public register()
    {
        var self = this;

        akala.injectWithName(['interpreters'], function (interpreters: Interpreter[])
        {
            interpreters.push(function (context: KeywordContext, next: (error?: any) => void, callback: (answer: string) => void)
            {
                try
                {
                    self.process(context, next, callback);
                }
                catch (ex)
                {
                    next({ message: ex.message, stack: ex.stack });
                }
            });
        })();
    }

    protected actions: Map<string[]>;
    protected keywords: Map<string[]>;
    protected others: Map<string[]>;

    public understand(cmd: KeywordContext)
    {
        cmd.action = this.findInfo(this.actions, cmd.text);
        log('action: ' + cmd.action);
        cmd.keyword = this.findInfo(this.keywords, cmd.text);
        log('keywords: ' + cmd.keyword);
        cmd.other = this.findInfo(this.others, cmd.text);
        log('other: ' + cmd.other);
    }

    public process(context: KeywordContext, next: (error?: any) => void, callback: (answer: string) => void): void
    {
        this.understand(context);
        if (!context.keyword)
            next();
        if (!context.deferred)
            this.execute(context, next, callback);
    }

    public abstract execute(context: KeywordContext, next: (error?: any) => void, callback: (answer: string) => void);
};