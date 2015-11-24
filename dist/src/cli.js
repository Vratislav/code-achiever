/// <reference path="../typings/yargs/yargs.d.ts" />
var yargs = require('yargs');
var CLI = (function () {
    function CLI() {
        this.yargs = yargs.options({
            'f': {
                alias: 'file',
                demand: false,
                describe: 'JSON files including test cases that you want the Judge to judge by. You can use GLOB pattern. [required]',
                type: 'array'
            },
            'p': {
                alias: 'port',
                demand: false,
                describe: 'Port on which judge should be listening'
            },
            'v': {
                alias: 'version',
                demand: false,
                describe: 'Shows version of this code-achiever and exits'
            }
        });
        this.params = this.yargs.argv;
        // if(!this.params.v && !this.params.f){
        // 	this.yargs.showHelp();
        // 	console.log('');
        // 	console.log('Missing required parameter -f');
        // 	console.log('');
        // 	process.exit(0);
        // }
    }
    CLI.prototype.getConfig = function () {
        var config = {};
        if (this.params.p) {
            config.port = this.params.p;
        }
        if (this.params.v) {
            config.showVersion = true;
        }
        return config;
    };
    return CLI;
})();
exports.CLI = CLI;
//# sourceMappingURL=cli.js.map