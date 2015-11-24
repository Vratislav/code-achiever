require('source-map-support').install();
var cli_1 = require('./src/cli');
var _ = require('underscore');
var repository_1 = require('./src/repository');
var Metrics = require('./src/metrics');
var Achievments = require('./src/achievments');
var announcer_1 = require('./src/announcer');
var server_1 = require('./src/server');
var defaultConfig = {
    port: 3001,
    logLevel: "INFO",
    showVersion: false,
    redisUrl: process.env["REDIS_URL"],
    slackWebhookUrl: process.env["SLACK_WEBHOOK_URL"]
};
var cli = new cli_1.CLI();
var configFromCli = cli.getConfig();
var config = _.extend(defaultConfig, configFromCli);
if (config.showVersion) {
    var pjson = require('../package.json');
    console.log("v" + pjson.version);
    process.exit(0);
}
var vkj = {
    id: "vkj",
    githubName: "Vratislav",
    slackName: "Vratislav",
    achievments: {},
    metrics: {}
};
var repo = new repository_1.Repository(config.redisUrl);
repo.createPlayerIfDoesNotExtist(vkj);
var achievmentManager = new Achievments.AchievmentManager();
achievmentManager.registerSimpleMetric(Metrics.commitCountMetric);
achievmentManager.registerAchievment(new Achievments.FirstCommitAchievment());
var announcer = new announcer_1.Announcer(config);
var server = new server_1.Server(config);
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