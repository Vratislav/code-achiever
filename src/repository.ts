import redis = require('redis')
import bluebird = require('bluebird')
import Rx = require('rxjs')
import {Observable} from 'rxjs'
import {createObservable} from './utils'
import {Player,PlayerData} from './player'
import _ = require('underscore')
(bluebird as any).promisifyAll((<any>redis).RedisClient.prototype);
const playersHashKey = "CA.Players";
const githubEventsHashKey = "CA.GitHub.Events"







export class Repository{
	client : redis.RedisClient;
	clientAsync : any;

	clientObs : Observable<redis.RedisClient>;

	constructor(redisUrl : string){
		this.clientObs = createObservable((observer : Rx.Observer<redis.RedisClient>)=>{
			const client = redis.createClient(redisUrl);
			client.on("connect",()=>{
				console.log("connected to redis server");
				var data = JSON.stringify({"integerVal":123456,"nested": {"Nested shit":[1,2,"car"]}})
				console.log("Storing testing data");
				client.set("test_data",data,()=>{
					console.log("saved")
					client.get("test_data",(err,dat)=>{
						console.log("Retrieved:",dat);
						observer.next(client);
					});
				});
			});
		}).publishReplay(1);

		(this.clientObs as any).connect();




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

	getPlayers():Promise<Player[]>{
		return this.clientAsync.hgetallAsync(playersHashKey).then((playersHash)=>{
			//console.log(playersHash)
			var players : PlayerData[] = _.values(playersHash);
			var pls : Player[] = [];
			for(var i = 0; i< players.length; i++){
				var player = new Player(players[i],this);
				pls.push(player);
			}
			return pls;
		});
	}

	get players() : Observable<Player[]> {
		return this.clientObs
		.flatMap((c : any) => Rx.Observable.fromPromise(c.hgetallAsync(playersHashKey)))
		.do(c => console.log(c))
		.map(playerHash => _.values(playerHash))
		.map(playerDatas => playerDatas.map(playerData => new Player(playerData as any,this)))
		.take(1)
	}

	get githubEvents() : Observable<any[]> {
		console.log("github events requested");
		return this.clientObs
		.flatMap((c : any) => {
			console.log("Returning cGetAsync");
			return Rx.Observable.fromPromise(c.lrangeAsync(githubEventsHashKey,0,30))
				.map((eventJsonStrings : string[])=>{
					return eventJsonStrings.map((s) => JSON.parse(s));
				});
		})
		//.map( l => l || [])
		.take(1)
	}

	storeGithubEvent(event : any) : Observable<any> {
		return this.clientObs.map(c => {
			c.lpush(githubEventsHashKey,JSON.stringify(event));
			c.ltrim(githubEventsHashKey,0,30);
			return event;
		});
	}



	savePlayerObs = (player : Player) : Observable<Player> => {
		return this.clientObs.map(c => {
			c.hset(playersHashKey,player.data.id, JSON.stringify(player.data));
			return player;
		});
	}

	savePlayer(player:Player):Promise<Player>{
		return this.clientAsync.hsetAsync(playersHashKey,player.data.id,JSON.stringify(player.data)).then(()=>{
			console.log("Player",player.data.id,"saved");
			return player;
		})
	}


}


