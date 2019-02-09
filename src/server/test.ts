var EventEmitter=require('events');

var emitter=new EventEmitter();

emitter.on('test', function(context){
    context.text+='dd';
});
emitter.on('test', function(context){
    context.text=context.text.replace(/c/g, 'e');
});
var ctx={text:'aabbcc'};
emitter.emit('test', ctx);
console.log(ctx.text);