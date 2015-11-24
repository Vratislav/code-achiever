var express = require('express');
var Metrics = require('./metrics');
var bodyParser = require('body-parser');
var colors = require('colors/safe');
var Server = (function () {
    function Server(config, repository, achievementsManager, announcer) {
        this.config = config;
        this.repo = repository;
        this.app = express();
        this.configureMiddleware();
        this.configureRoutes();
        this.achievementsManager = achievementsManager;
        this.announcer = announcer;
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
        var _this = this;
        var app = this.app;
        app.post('/github/hook', function (req, resp) {
            console.log("Recieved on /github/hook:");
            if (req.header("X-GitHub-Event") == "push") {
                var pushEvent = req.body;
                _this.repo.getPlayerByMatcher(function (p) {
                    return p.data.githubName == pushEvent.sender.login;
                }).then(function (p) {
                    if (p) {
                        var value = _this.achievementsManager.getMetric(p, Metrics.commitCountMetric.id).getValue();
                        if (!value) {
                            value = 0;
                        }
                        var achievements = _this.achievementsManager.updateMetric(p, Metrics.commitCountMetric.id, value + 1);
                        achievements.forEach(function (achievment) {
                            _this.announcer.announceAchievment(p, achievment);
                        });
                        p.save();
                    }
                });
            }
            console.log(req.body);
            resp.sendStatus(200);
        });
    };
    return Server;
})();
exports.Server = Server;
//# sourceMappingURL=server.js.map