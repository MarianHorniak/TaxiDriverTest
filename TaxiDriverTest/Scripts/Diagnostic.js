

var Diagnostic = {

    //kedy bol naposledy refresh ? 
    lastRefresh: Date.now(),
    a_TraceLog: new Array(),
    logLength: 20,

    //main entry
    log: function (message, OptionalParams) {

        window.setTimeout(function () {
            Diagnostic.logAsync(message, OptionalParams);
        });
    },


    //async call
    logAsync: function (message, OptionalParams) {

        console.log(message, OptionalParams);
        if (Diagnostic.a_TraceLog.length > Diagnostic.logLength) {
            Diagnostic.a_TraceLog.splice(Diagnostic.a_TraceLog.length, 1);
        }
        Diagnostic.a_TraceLog[Diagnostic.a_TraceLog.length] = { Date: Date.now, Message: message };

        lastRefresh: Date.now();
    },

    //get log array
    getLog: function () {
        return Diagnostic.a_TraceLog;
    }
}