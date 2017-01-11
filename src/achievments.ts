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

export class ForcePushAchievment2 extends GreaterThanAchievment {
	constructor(){
		super();
		this.id = "force.push.10";
		this.name = "The force is strong with this one..."
		this.description = "May the FORCE Push be with you! (Force push over 10 times.)"
		this.metricId = Metrics.forcePushCountMetric.id;
		this.imageUrl = "https://cdn.meme.am/instances/500x/59119268.jpg"
		this.greaterThan = 9;
		this.setup();
	}
}

export class NightCoderAchievement extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "commit.time.night";
		this.name = "Late night coder"
		this.description = "The best code is written during the night. (Commit during the night.)"
		this.metricId = Metrics.commitTimeNight.id;
		this.imageUrl = "https://d13yacurqjgara.cloudfront.net/users/416610/screenshots/2391640/tableillo_1x.png"
		this.greaterThan = 0;
		this.setup();
	}
}

export class MidnightCommitAchievement extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "commit.time.midnight";
		this.name = "The Midnight commit"
		this.description = "Code commited right after the day died has a magical power of going through CI 5% faster!"
		this.metricId = Metrics.commitTimeMidnight.id;
		this.imageUrl = "http://maxpixel.freegreatpicture.com/static/photo/1x/Night-Midnight-Stars-Dark-Moon-Halloween-Sky-315204.jpg"
		this.greaterThan = 0;
		this.setup();
	}
}

export class EarlyBirdAchievement extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "commit.time.morning";
		this.name = "The Early Bird"
		this.description = "Get up early and get shit done. That's just how you roll!"
		this.metricId = Metrics.commitTimeMorning.id;
		this.imageUrl = "https://cdn.pixabay.com/photo/2013/07/13/13/42/tux-161439_1280.png"
		this.greaterThan = 0;
		this.setup();
	}
}

export class BugSquisherAchievement extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "commit.bugfix.1";
		this.name = "The Bug Squisher"
		this.description = "You do not like bugs. You fix bugs. Life is nice."
		this.metricId = Metrics.bugfixCommitCountMetric.id;
		this.imageUrl = "http://www.thecomputeradvisor.net/gallery/how-to-fix-software-bugs/how_to_fix_software_bugs.jpg"
		this.greaterThan = 0;
		this.setup();
	}
}

export class BugSquisherAchievement2 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "commit.bugfix.2";
		this.name = "Bug Hunter"
		this.description = "You find them and fix them. You are the hero our repository needs but does not deserve."
		this.metricId = Metrics.bugfixCommitCountMetric.id;
		this.imageUrl = "https://www.browserling.com/images/features/bug-hunter-cross-browser-testing.png"
		this.greaterThan = 4;
		this.setup();
	}
}

export class BugSquisherAchievement3 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "commit.bugfix.3";
		this.name = "Bug Exterminator"
		this.description = "You are a bug killing machine. Nothing can stop you."
		this.metricId = Metrics.bugfixCommitCountMetric.id;
		this.imageUrl = "http://dustbusterslb.com/Home/wp-content/uploads/2015/11/big-guns-pest-control281301995.jpg"
		this.greaterThan = 19;
		this.setup();
	}
}


export class BugSquisherAchievement4 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "commit.bugfix.4";
		this.name = "Bug Killing Semi-god"
		this.description = "You are the sentinel that protects our production from bugs. You are the guru of Bug crushing. "
		this.metricId = Metrics.bugfixCommitCountMetric.id;
		this.imageUrl = "http://powerlineinfo.com/wp-content/uploads/2013/08/pest-control-pest-exterminator.png"
		this.greaterThan = 99;
		this.setup();
	}
}


export class MergeBranchAchievement1 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "branch.merge.1";
		this.name = "The merger!"
		this.description = "You have just merged two branches of code together! Congratz!"
		this.metricId = Metrics.branchMergeCountMetric.id;
		this.imageUrl = "http://m.memegen.com/4ao283.jpg"
		this.greaterThan = 0;
		this.setup();
	}
}

export class MergeBranchAchievement2 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "branch.merge.2";
		this.name = "eMerging beast!"
		this.description = "Merging is just your thing. You were born for it. (Merge over 10 branches.)"
		this.metricId = Metrics.branchMergeCountMetric.id;
		this.imageUrl = "http://weknowmemes.com/generator/uploads/generated/g1384940748876722625.jpg"
		this.greaterThan = 10;
		this.setup();
	}
}


export const allAchievements : Achievment[] = [
	new FirstCommitAchievment(),
	new Commit10Achievment(),
	new Commit50Achievment(),
	new Commit100Achievment(),
	new ForcePushAchievment(),
	new ForcePushAchievment2(),
	new NightCoderAchievement(),
	new MidnightCommitAchievement(),
	new EarlyBirdAchievement(),
	new BugSquisherAchievement(),
	new BugSquisherAchievement2(),
	new BugSquisherAchievement3(),
	new BugSquisherAchievement4(),
	new MergeBranchAchievement1(),
	new MergeBranchAchievement2()
]