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
	slackWebhookUrl : process.env["SLACK_WEBHOOK_URL"]
}

var cli = new CLI();
var configFromCli = cli.getConfig();

var config : Config = _.extend(defaultConfig,configFromCli);

if(config.showVersion){
	var pjson = require('../package.json');
	console.log("v" + pjson.version);
	process.exit(0);
}

var vkj : PlayerData = {
	id : "vkj",
	githubName : "Vratislav",
	slackName : "Vratislav",
	achievments : {},
	metrics : {}
}


var repo = new Repository(config.redisUrl);
repo.createPlayerIfDoesNotExtist(vkj);
var achievmentManager = new Achievments.AchievmentManager();
achievmentManager.registerSimpleMetric(Metrics.commitCountMetric);
achievmentManager.registerAchievment(new Achievments.FirstCommitAchievment());
var announcer = new Announcer(config);

var server = new Server(config);
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

