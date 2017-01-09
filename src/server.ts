import {Config} from './config'
import express = require('express');
import {Repository} from './repository'
import _ = require('underscore')
import {AchievmentManager} from './achievments'
import {Announcer} from './announcer'
import {mountAdminRoutes} from './adminApi/admin'
import * as Metrics from './metrics'
var bodyParser = require('body-parser')
var colors = require('colors/safe');
import {GithubHandler} from './github-handler'



export class Server{
	app : express.Express;
	config : Config
	private listener : any;
	repo : Repository;
	achievementsManager : AchievmentManager
	announcer: Announcer

	constructor(config : Config,repository:Repository,achievementsManager:AchievmentManager,announcer: Announcer){
		this.config = config;
		this.repo = repository;
		this.app = express();
		this.configureMiddleware();
		this.configureRoutes();
		this.achievementsManager = achievementsManager;
		this.announcer = announcer;
	}



	start():void{
		this.listener = this.app.listen(this.config.port);
		// this.repo.players.subscribe((players) => {
		// 	console.log(players);
		// })
		console.log(colors.green("CodeAchiever is running on port " + this.config.port));
	}

	stop():void{
		if(this.listener){
			this.listener.close();
		}
		console.log("Code achiever server stopped.")
	}


	private configureMiddleware(){
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(bodyParser.json());
	}

	private configureRoutes(){
		var app = this.app;

		mountAdminRoutes({
			app: app,
			repostirory: this.repo,
			adminToken: this.config.adminToken
		});

		app.post('/github/hook',
			(req,resp)=>{
				//console.log("Recieved on /github/hook:");
				if(req.header("X-GitHub-Event") == "push"){
					var pushEvent : GHPushEvent = req.body;
					const handler = new GithubHandler(this.repo,this.achievementsManager,this.announcer);
					handler.handle(req,req.header("X-GitHub-Event"));


					// this.repo.getPlayerByMatcher((p)=>{
					// 	return p.data.githubName == pushEvent.sender.login
					// }).then((p) => {
					// 	if(p){
					// 		var value = this.achievementsManager.getMetric(p,Metrics.commitCountMetric.id).getValue();
					// 		if(!value){
					// 			value = 0;
					// 		}
					// 		var achievements = this.achievementsManager.updateMetric(p,Metrics.commitCountMetric.id,value+1)
					// 		achievements.forEach((achievment)=>{
					// 			this.announcer.announceAchievment(p,achievment)
					// 		});
					// 		p.save();
					// 	}
					// })

				}
				//console.log(req.body);
				resp.sendStatus(200);
			});
	}

}

interface GHPushEvent {
	sender : GHSender
}

interface GHSender{
	login : String
}







