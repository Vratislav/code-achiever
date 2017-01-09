import {Achiever} from './achiever'
import _ = require('underscore')
import * as Metrics from './metrics'

export class Achievment{
	id : string;
	name : string;
	description : string;
	imageUrl : string;
	metricWatches : string[] = [];

	constructor(){

	}

	resolveId(token?:string) : string{
		if(token){
			 return token + "::" + this.id;
		}else{
			 return this.id;
		}
	}

	award(achiever:Achiever,token?:string){
		achiever.achievments[this.resolveId(token)] = "awarded";
	}

	awardIfNotAwarded(achiever:Achiever,token?:string):boolean{
		if(!achiever.achievments[this.resolveId(token)]){
			 this.award(achiever,token);
			 return true;
		}
		return false;
	}

	shouldAward(achiever:Achiever,metrics : {[metricId:string]:Metrics.ResolvedMetric},token?:string):boolean{
		return false;
	}

}

class GreaterThanAchievment extends Achievment {
	metricId : string;
	greaterThan : number;

	constructor(){
		super();

	}

	protected setup(){
		this.metricWatches.push(this.metricId);
	}

	shouldAward(achiever:Achiever,metrics : {[metricId:string]:Metrics.ResolvedMetric},token?:string):boolean{
		//console.log('Should I award this greate than metric?',metrics[this.metricId].getValue())
		var result =  metrics[this.metricId].getValue() > this.greaterThan;
		//console.log(result);
		return result;
	}
}






export class AchievmentManager{
	achievments : {[resolvedId : string]:Achievment} = {}
	metrics : {[resolvedId : string]:Metrics.Metric} = {}
	watches : {[resolvedId : string]:Achievment[]} = {}


	registerAchievment(achievment : Achievment){
		this.achievments[achievment.resolveId()] = achievment;
		achievment.metricWatches.forEach((metricId)=>{
			this.registerWatch(metricId,achievment);
		});
		console.log("Registered achievment:",achievment.id , "metrics watches:", achievment.metricWatches.join(','))
	}

	registerSimpleMetric(simpleMetric : Metrics.SimpleMetric){
		this.metrics[simpleMetric.id] = new Metrics.Metric();
		this.metrics[simpleMetric.id].id = simpleMetric.id;
		console.log("Registered metric:",simpleMetric.id);
	}

	getMetric(achiever:Achiever,metricId:string,token?:string) : Metrics.ResolvedMetric{
		console.log(`Getting metric ${metricId}`);
		return new Metrics.ResolvedMetric(achiever,this.metrics[metricId],token);
	}

	updateMetric<T extends Achiever>(achiever:T,metricId : string,value:any,token?:string):Achievment[]{
		console.log(achiever.name,'updating metric:',metricId,'value:',value,'token:',token);
		var awardedAchievments : Achievment[] = [];
		var metricObj = this.metrics[metricId];
		var resolvedMetricId = metricObj.resolveId(token);
		metricObj.update(achiever,resolvedMetricId,value);
		var affectedAchievments : Achievment[] = this.watches[metricId] || [];
		console.log("Affected achievments",affectedAchievments);
		for (var index = 0; index < affectedAchievments.length; index++) {
			var achievment = affectedAchievments[index];
			var relevantMetrics = _.mapObject(_.pick(this.metrics,achievment.metricWatches),(val,key)=>{
				return new Metrics.ResolvedMetric(achiever,<Metrics.Metric>val,token);
			});
			console.log('Relevant metrics for',achievment.id,':',relevantMetrics)
			if(achievment.shouldAward(achiever,relevantMetrics,token)){
				if(achievment.awardIfNotAwarded(achiever,token)){
					console.log('Awarded achievment', achievment.id,'to achiever',achiever.name)
					awardedAchievments.push(achievment);
				}
			}
		}
		return awardedAchievments;
	}

	bumpMetric(achiever:Achiever,metricId:string,token?:string):Achievment[]{
		var metric = this.getMetric(achiever,metricId,token);
		var value = metric.getValue();
		if(!value){
			value = 0;
		}
		value = value + 1;
		return this.updateMetric(achiever,metricId,value,token);
	}

	private registerWatch(metricId: string,achievment : Achievment){
		if(!this.watches[metricId]){
			this.watches[metricId] = [];
		}
		this.watches[metricId].push(achievment);
	}



}


export class FirstCommitAchievment extends GreaterThanAchievment {
	constructor(){
		super();
		this.id = "first.commit";
		this.name = "Congrats! It's a commit!"
		this.description = "Push your first commit into the repository"
		this.metricId = Metrics.commitCountMetric.id;
		this.imageUrl = "https://a248.e.akamai.net/assets.github.com/images/modules/404/parallax_octocat.png?1293753715"
		this.greaterThan = 0;
		this.setup();
	}
}

export class Commit10Achievment extends GreaterThanAchievment {
	constructor(){
		super();
		this.id = "commit.count.10";
		this.name = "Yes, I do commit!"
		this.description = "Push 10 commits into the repository"
		this.metricId = Metrics.commitCountMetric.id;
		this.imageUrl = "http://cameronmcefee.com/img/work/the-octocat/codercat.jpg"
		this.greaterThan = 10;
		this.setup();
	}
}

export class Commit50Achievment extends GreaterThanAchievment {
	constructor(){
		super();
		this.id = "commit.count.50";
		this.name = "But of course Yes! I do quite enjoy commiting!"
		this.description = "Push 50 commits into the repository"
		this.metricId = Metrics.commitCountMetric.id;
		this.imageUrl = "https://octodex.github.com/images/founding-father.jpg"
		this.greaterThan = 50;
		this.setup();
	}
}

export class Commit100Achievment extends GreaterThanAchievment {
	constructor(){
		super();
		this.id = "commit.count.100";
		this.name = "Do you even commit, bro?"
		this.description = "Whoa! Push 100 commits into the repository!"
		this.metricId = Metrics.commitCountMetric.id;
		this.imageUrl = "https://octodex.github.com/images/steroidtocat.png"
		this.greaterThan = 100;
		this.setup();
	}
}


export class ForcePushAchievment extends GreaterThanAchievment {
	constructor(){
		super();
		this.id = "force.push";
		this.name = "Say hello to Mr. Force Push!"
		this.description = "You just force pushed into the repository!"
		this.metricId = Metrics.forcePushCountMetric.id;
		this.imageUrl = "http://www.mememaker.net/static/images/memes/3914636.jpg"
		this.greaterThan = 0;
		this.setup();
	}
}


export const allAchievements : Achievment[] = [
	new FirstCommitAchievment(),
	new Commit10Achievment(),
	new Commit50Achievment(),
	new Commit100Achievment(),
	new ForcePushAchievment()
]