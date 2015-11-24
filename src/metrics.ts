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