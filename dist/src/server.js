var express = require('express');
var bodyParser = require('body-parser');
var colors = require('colors/safe');
var Server = (function () {
    function Server(config) {
        this.config = config;
        this.app = express();
        this.configureMiddleware();
        this.configureRoutes();
    }
    Server.prototype.start = function () {
        this.listener = this.app.listen(this.config.port);
        console.log(colors.green("CodeAchiever is running on port " + this.config.port));
    };
    Server.prototype.stop = function () {
        if (this.listener) {
            this.listener.close();
        }
        console.log("Code achiever server stopped.");
    };
    Server.prototype.configureMiddleware = function () {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
    };
    Server.prototype.configureRoutes = function () {
        var app = this.app;
        app.post('/github/hook', function (req, resp) {
            console.log("Recieved on /github/hook:");
            console.log(req.body);
            resp.sendStatus(200);
        });
    };
    return Server;
})();
exports.Server = Server;
//# sourceMappingURL=server.js.map