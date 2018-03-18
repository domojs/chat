///<reference types="@akala/client" />

interface Scope extends akala.IScope<Scope>
{
    messages: akala.ObservableArray<any>;
    ask(http: akala.Http): boolean;
    text: string;
}

akala.run(['$part', '$http'], function (part: akala.Part, http: akala.Http)
{
    part.use<Scope>('/chat', 'body', {
        template: '/chat/index.html',
        controller: function (scope)
        {
            scope.messages = new akala.ObservableArray<any>([]);
            scope.ask = function ($http: akala.Http)
            {
                scope.messages.push({ text: scope.text, fromUser: true });
                http.get('/api/chat/ask', { q: scope.text }).then(function (response)
                {
                    scope.messages.push({ text: response, fromUser: false });
                    scope.$set('text', '');
                    // $('html,body').animate({
                    //     scrollTop: 2000
                    // }, 1000, 'swing');
                });
                return false;
            }
        }
    });
});