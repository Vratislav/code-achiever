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

//


export class GemMasterAchievement1 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "ruby.gemmaster.1";
		this.name = "Gem Apprentice"
		this.description = "You can appreciate a good gem and you know how to use them for the good of your team."
		this.metricId = Metrics.filesModifiedGemfile.id;
		this.imageUrl = "http://data-creative.info/assets/img/posts/rubygems_logo_red.png"
		this.greaterThan = 0;
		this.setup();
	}
}

export class GemMasterAchievement2 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "ruby.gemmaster.2";
		this.name = "Gem Master"
		this.description = "If there is gem for it, you will find it. And you will USE IT! (modify gemfile over 10 times)"
		this.metricId = Metrics.filesModifiedGemfile.id;
		this.imageUrl = "https://stormpath.com/wp-content/uploads/2016/04/preview_COLOURBOX4628597.jpg"
		this.greaterThan = 10;
		this.setup();
	}
}

export class NPMAchievement extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "js.npm.1";
		this.name = "The Package Manager"
		this.description = "You have packages for everything and NPM is your friend. (You have a wet dreams about Yarn though every now and then.)"
		this.metricId = Metrics.filesModifiedNPM.id;
		this.imageUrl = "http://68.media.tumblr.com/1e63026e4211a6e7711fe95d5ff6b13e/tumblr_inline_nn489p271Z1t68bpr_500.png"
		this.greaterThan = 0;
		this.setup();
	}
}


export class NPMAchievement2 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "js.npm.2";
		this.name = "The Node Package Crew"
		this.description = "You really know your way around packages. 9 out of 10 NPM wombats would vote for you in the upcomming presidential election."
		this.metricId = Metrics.filesModifiedNPM.id;
		this.imageUrl = "https://pbs.twimg.com/media/CTFdOYHVAAA3DFU.png"
		this.greaterThan = 10;
		this.setup();
	}
}

export class RubyAchievement extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "ruby.1";
		this.name = "The Ruby Novice"
		this.description = "You tinker with ruby. Sometimes. (Modify .rb files in 10 commits)"
		this.metricId = Metrics.filesModifiedRuby.id;
		this.imageUrl = "https://images-na.ssl-images-amazon.com/images/I/51W-ycYHWNL._AC_UL320_SR254,320_.jpg"
		this.greaterThan = 10;
		this.setup();
	}
}

export class RubyAchievement2 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "ruby.2";
		this.name = "The Ruby Developer"
		this.description = "You do ruby pretty often! (Modify .rb files in 100 commits)"
		this.metricId = Metrics.filesModifiedRuby.id;
		this.imageUrl = "http://skillhot.com/wp-content/uploads/2016/02/The-Complete-Ruby-Developer-A-guide-to-going-from-Zero-to-Ruby-developer.jpg"
		this.greaterThan = 100;
		this.setup();
	}
}

export class RubyAchievement3 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "ruby.3";
		this.name = "The Ruby Ninja"
		this.description = "You move in the shadows, you only leave a trace of well-written ruby code. (Modify .rb files in 250 commits)"
		this.metricId = Metrics.filesModifiedRuby.id;
		this.imageUrl = "https://www.drupal.org/files/user-pictures/picture-3007075-1470027662.gif"
		this.greaterThan = 250;
		this.setup();
	}
}

export class RubyAchievement4 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "ruby.4";
		this.name = "The Ruby Warrior"
		this.description = "With IRB sword in hand and specs as your shield, you tackle any challenge. Nothing can defeat you.  (Modify .rb files in 500 commits)"
		this.metricId = Metrics.filesModifiedRuby.id;
		this.imageUrl = "https://cdn3.bloc.io/assets/ruby_warrior/spartacus-b2f5da3d2243ee3faffa0b30a0f733b0.png"
		this.greaterThan = 500;
		this.setup();
	}
}

export class RubyAchievement5 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "ruby.5";
		this.name = "The Ruby Mage"
		this.description = "You know the sacred ruby incantations. Those famous one-liners of yours saved your team countless of times. (Modify .rb files in 1000 commits!)"
		this.metricId = Metrics.filesModifiedRuby.id;
		this.imageUrl = "http://www.finalfantasyd20.com/ffd20/images/RedMage_by_FantasyAce.jpg"
		this.greaterThan = 1000;
		this.setup();
	}
}


export class RubyAchievement6 extends GreaterThanAchievment{
	constructor(){
		super();
		this.id = "ruby.6";
		this.name = "The Master of Ruby ZEN"
		this.description = "There is peace in your soul. You have reached the enlightement."
		this.metricId = Metrics.filesModifiedRuby.id;
		this.imageUrl = "https://s-media-cache-ak0.pinimg.com/originals/d1/4b/66/d14b66a060ed807e25d2ec1bc55e6545.jpg"
		this.greaterThan = 1000;
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
	new MergeBranchAchievement2(),
	new GemMasterAchievement1(),
	new GemMasterAchievement2(),
	new NPMAchievement(),
	new NPMAchievement2(),
	new RubyAchievement(),
	new RubyAchievement2(),
	new RubyAchievement3(),
	new RubyAchievement4(),
	new RubyAchievement5(),
	new RubyAchievement6(),
]