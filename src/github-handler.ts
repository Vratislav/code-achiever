import {Announcer} from './announcer'
import * as Metrics from './metrics'
import * as Achievments from './achievments'
import {Repository} from './repository'

class GithubHandler{
	repo : Repository;
	achievementsManager : Achievments.AchievmentManager
	announcer: Announcer	
	
	
	constructor(repository:Repository,achievementsManager:Achievments.AchievmentManager,announcer: Announcer){
		this.repo = repository;
		this.achievementsManager = achievementsManager;
		this.announcer = announcer;
	}
	
	handle(body,eventType:string){
		this.repo.getPlayerByMatcher((p)=>{
			return p.data.githubName == body.sender.login
		}).then((p) => {
			if(p){
				if(eventType == "push"){
					var pushEvent : GHPushEvent = body;
					
				}
				// var value = this.achievementsManager.getMetric(p,Metrics.commitCountMetric.id).getValue();
				// if(!value){
				// 	value = 0;
				// }
				// var achievements = this.achievementsManager.updateMetric(p,Metrics.commitCountMetric.id,value+1)
				// achievements.forEach((achievment)=>{
				// 	this.announcer.announceAchievment(p,achievment)
				// });
				p.save();
			}
		});		

	}
	
	
}

interface GHPushEvent {
	sender : GHSender
}

interface GHSender{
	login : String
}