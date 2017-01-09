"use strict";
const Rx = require("rxjs");
function createObservable(obsFunction) {
    return Rx.Observable.create(obsFunction);
}
exports.createObservable = createObservable;
function logError(error) {
    console.log(`Got error: ${error}`);
    if (error.stack) {
        console.log('Stack:');
        console.log(error.stack);
    }
}
exports.logError = logError;
function logAndThrow(error) {
    logError(error);
    throw error;
}
exports.logAndThrow = logAndThrow;
function logAndEnd(res) {
    return (error) => {
        logError(error);
        res.status(500).end();
    };
}
exports.logAndEnd = logAndEnd;
//# sourceMappingURL=utils.js.map