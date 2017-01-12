import {Achiever} from './achiever'

export class ResolvedMetric{
	metric : Metric;
	achiever : Achiever;
	token : string;
	constructor(achiever:Achiever,metric:Metric,token?:string){
		this.achiever =achiever;
		this.metric = metric;
		this.token = token;
	}

	getValue():any{
		return this.metric.getValue(this.achiever,this.metric.resolveId(this.token));
	}
}


export interface SimpleMetric{
	id : string;
}






export class Metric implements SimpleMetric{
	id : string;


	static resolveId(id:string,token?:string) : string{
		if(token){
			return token + "::" + id;
		}else{
			return id;
		}
	}

	resolveId(token?:string) : string{
		return Metric.resolveId(this.id,token);
	}

	update(achiever : Achiever, resolvedMetricId : string,  value:any){
		achiever.metrics[resolvedMetricId] = value;
	}

	getValue(achiever : Achiever, resolvedMetricId : string):any{
		//console.log('Looking at',resolvedMetricId,'for value')
		var val = achiever.metrics[resolvedMetricId];
		//console.log('Value',val);
		if(val === undefined){
			return null;
		}
		return val;
	}
}



export var commitCountMetric : SimpleMetric = {id:"commit.count"}
export var pushCountMetric : SimpleMetric = {id:"push.count"}
export var forcePushCountMetric : SimpleMetric = {id:"force.push.count"}
export var commitTimeMidnight : SimpleMetric = {id:"commit.time.midnight"}
export var commitTimeNight : SimpleMetric = {id:"commit.time.night"}
export var commitTimeMorning : SimpleMetric = {id:"commit.time.morning"}
export var bugfixCommitCountMetric : SimpleMetric = {id:"commit.bugfix.count"}
export var branchMergeCountMetric : SimpleMetric = {id:"branch.merge.count"}
export var filesModifiedGemfile : SimpleMetric = {id:"files.modified.gemfile"}
export var filesModifiedNPM : SimpleMetric = {id:"files.modified.npm"}
export var filesModifiedDevOps : SimpleMetric = {id: "files.modified.devops"}
export var filesModifiedRuby : SimpleMetric = {id: "files.modified.ruby"}
export var filesModifiedJavascript : SimpleMetric = {id: "files.modified.javascript"}
export var filesModifiedTypescript : SimpleMetric = {id: "files.modified.typescript"}

export var allMetrics = [
	commitCountMetric,
	pushCountMetric,
	forcePushCountMetric,
	commitTimeMidnight,
	commitTimeNight,
	commitTimeMorning,
	bugfixCommitCountMetric,
	branchMergeCountMetric,
	filesModifiedGemfile,
	filesModifiedNPM,
	filesModifiedDevOps,
	filesModifiedRuby,
	filesModifiedJavascript,
	filesModifiedTypescript
]