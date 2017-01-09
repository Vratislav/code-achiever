"use strict";
const express = require("express");
const admin_1 = require("./adminApi/admin");
var bodyParser = require('body-parser');
var colors = require('colors/safe');
const github_handler_1 = require("./github-handler");
class Server {
    constructor(config, repository, achievementsManager, announcer) {
        this.config = config;
        this.repo = repository;
        this.app = express();
        this.configureMiddleware();
        this.configureRoutes();
        this.achievementsManager = achievementsManager;
        this.announcer = announcer;
    }
    start() {
        this.listener = this.app.listen(this.config.port);
        // this.repo.players.subscribe((players) => {
        // 	console.log(players);
        // })
        console.log(colors.green("CodeAchiever is running on port " + this.config.port));
    }
    stop() {
        if (this.listener) {
            this.listener.close();
        }
        console.log("Code achiever server stopped.");
    }
    configureMiddleware() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
    }
    configureRoutes() {
        var app = this.app;
        admin_1.mountAdminRoutes({
            app: app,
            repostirory: this.repo,
            adminToken: this.config.adminToken
        });
        app.post('/github/hook', (req, resp) => {
            //console.log("Recieved on /github/hook:");
            if (req.header("X-GitHub-Event") == "push") {
                var pushEvent = req.body;
                const handler = new github_handler_1.GithubHandler(this.repo, this.achievementsManager, this.announcer);
                handler.handle(req, req.header("X-GitHub-Event"));
            }
            //console.log(req.body);
            resp.sendStatus(200);
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map