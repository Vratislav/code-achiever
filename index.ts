require('source-map-support').install();
import {Config} from './src/config'
import {CLI} from './src/cli'
import _ = require('underscore')
import {Repository} from './src/repository'
import {PlayerData} from './src/player'
import * as Metrics from './src/metrics'
import * as Achievments from './src/achievments'
import {Announcer} from './src/announcer'
import {Server} from './src/server'
var defaultConfig : Config = {
	port : 3001,
	logLevel : "INFO",
	showVersion : false,
	redisUrl : process.env["REDIS_URL"],
	slackWebhookUrl : process.env["SLACK_WEBHOOK_URL"],
	adminToken : process.env["ADMIN_TOKEN"]
}

var cli = new CLI();
var configFromCli = cli.getConfig();

var config : Config = _.extend(defaultConfig,configFromCli);

if(config.showVersion){
	var pjson = require('../package.json');
	console.log("v" + pjson.version);
	process.exit(0);
}

var repo = new Repository(config.redisUrl);
var achievmentManager = new Achievments.AchievmentManager();
Metrics.allMetrics.forEach((m) => achievmentManager.registerSimpleMetric(m));
Achievments.allAchievements.forEach((a => achievmentManager.registerAchievment(a)));
var announcer = new Announcer(config);

var server = new Server(config,repo,achievmentManager,announcer);
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

process.on('SIGINT', function() {
	process.exit(0);
});

