"use strict";
require('source-map-support').install();
const cli_1 = require("./src/cli");
const _ = require("underscore");
const repository_1 = require("./src/repository");
const Metrics = require("./src/metrics");
const Achievments = require("./src/achievments");
const announcer_1 = require("./src/announcer");
const server_1 = require("./src/server");
var defaultConfig = {
    port: 3001,
    logLevel: "INFO",
    showVersion: false,
    redisUrl: process.env["REDIS_URL"],
    slackWebhookUrl: process.env["SLACK_WEBHOOK_URL"],
    adminToken: process.env["ADMIN_TOKEN"]
};
var cli = new cli_1.CLI();
var configFromCli = cli.getConfig();
var config = _.extend(defaultConfig, configFromCli);
if (config.showVersion) {
    var pjson = require('../package.json');
    console.log("v" + pjson.version);
    process.exit(0);
}

var repo = new repository_1.Repository(config.redisUrl);
var achievmentManager = new Achievments.AchievmentManager();
Metrics.allMetrics.forEach((m) => achievmentManager.registerSimpleMetric(m));
Achievments.allAchievements.forEach((a => achievmentManager.registerAchievment(a)));
var announcer = new announcer_1.Announcer(config);
var server = new server_1.Server(config, repo, achievmentManager, announcer);
server.start();
// repo.getPlayerByMatcher((p)=>{
// 	//console.log("Matching",p)
// 	return p.data.githubName == "Vratislav"
// }).then((p)=>{
// 	console.log("Matching",p.data)
// 	console.log("Found player by github name:",p.data.githubName);
// 	p.data.achievments = {};
// 	var achievements = achievmentManager.updateMetric(p,Metrics.commitCountMetric.id,1);
// 	achievements.forEach((achievment)=>{
// 		announcer.announceAchievment(p,achievment)
// 	})
// })
//console.log('Strating with CLI config',configFromCli);
// var judge = new Judge(config);
// judge.start();
process.on('SIGINT', function () {
    process.exit(0);
});
//# sourceMappingURL=index.js.map