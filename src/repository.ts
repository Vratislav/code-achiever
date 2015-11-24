import redis = require('redis')
import bluebird = require('bluebird')
import {Player,PlayerData} from './player'
import _ = require('underscore')
bluebird.promisifyAll((<any>redis).RedisClient.prototype);
var playersHashKey = "CA.Players";
export class Repository{
	client : redis.RedisClient;
	clientAsync : any;
	constructor(redisUrl : string){
		this.client = redis.createClient(redisUrl);
		this.clientAsync = this.client;
		this.client.on("connect",()=>{
			console.log("connected to redis server");
			
			var data = JSON.stringify({"integerVal":123456,"nested": {"Nested shit":[1,2,"car"]}})
			console.log("Storing testing data");
			this.client.set("test_data",data,()=>{
				console.log("saved")
				this.client.get("test_data",(err,dat)=>{
					console.log("Retrieved:",dat);
				});
			})
			
		});
		
		
		
	}
	
	createPlayerIfDoesNotExtist(playerData:PlayerData):Promise<Player>{
		
		
		return this.clientAsync.hgetAsync(playersHashKey,playerData.id).then((fetchedP:PlayerData)=>{
			if(!fetchedP){
				console.log("Player does not exist creating",playerData);
				return this.clientAsync.hsetAsync(playersHashKey,playerData.id,JSON.stringify(playerData)).then(()=>{
					return new Player(playerData,this);
				});
			}else{
				console.log("Player with id",playerData.id,"exists");
				return new Player(fetchedP,this);
			}
		});
	}
	
	getPlayerById(id:string):Promise<Player>{
		return this.clientAsync.hgetAsync(playersHashKey,id).then((pData)=>{
			return new Player(pData,this)
		});
	}
	
	getPlayerByMatcher(matcher:(playerData:Player)=>boolean):Promise<Player>{
		return this.clientAsync.hgetallAsync(playersHashKey).then((playersHash)=>{
			console.log(playersHash)
			var players : PlayerData[] = _.values(playersHash);
			for(var i = 0; i< players.length; i++){
				var player = new Player(players[i],this);
				if(matcher(player)){
					return player;
				}
			}
			return null; 
		});
	}
	
	savePlayer(player:Player):Promise<Player>{
		return this.clientAsync.hsetAsync(playersHashKey,player.data.id,JSON.stringify(player.data)).then(()=>{
			console.log("Player",player.data.id,"saved");
			return player;
		})
	}
	
	
}