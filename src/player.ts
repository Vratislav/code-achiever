import {Repository} from './repository'
import {Achiever} from './achiever'



export interface PlayerData{
	id : string;
	githubName : string;
	slackName : string;
	
	metrics : {[index:string] : any}
	achievments : {[index:string] : string}	
}

export class Player implements Achiever{
	data : PlayerData
	repo : Repository
	constructor(data:PlayerData,repository? : Repository){
		if(typeof(data) == "string"){
			data = JSON.parse(<any>data);
		}
		this.data = data;
		this.repo = repository;
	}
	
	get name() : string{
		if(this.data.slackName){
			return this.data.slackName;
		}
		
		if(this.data.githubName){
			return this.data.githubName;
		}		
		
		return this.data.id;
	}
	
	get type() : string{
		return "PLAYER";
	}
	
	get metrics(): {[index:string] : any}{
		return this.data.metrics;
	}
	
	get achievments(): {[index:string] : any}{
		return this.data.achievments;
	}	
	
	save() : Promise<Player>{
		return this.repo.savePlayer(this)
	}
}