"use strict";
const redis = require("redis");
const bluebird = require("bluebird");
const Rx = require("rxjs");
const utils_1 = require("./utils");
const player_1 = require("./player");
const _ = require("underscore");
bluebird.promisifyAll(redis.RedisClient.prototype);
const playersHashKey = "CA.Players";
const githubEventsHashKey = "CA.GitHub.Events";
class Repository {
    constructor(redisUrl) {
        this.savePlayerObs = (player) => {
            return this.clientObs.map(c => {
                c.hset(playersHashKey, player.data.id, JSON.stringify(player.data));
                return player;
            });
        };
        this.clientObs = utils_1.createObservable((observer) => {
            const client = redis.createClient(redisUrl);
            client.on("connect", () => {
                console.log("connected to redis server");
                var data = JSON.stringify({ "integerVal": 123456, "nested": { "Nested shit": [1, 2, "car"] } });
                console.log("Storing testing data");
                client.set("test_data", data, () => {
                    console.log("saved");
                    client.get("test_data", (err, dat) => {
                        console.log("Retrieved:", dat);
                        observer.next(client);
                    });
                });
            });
        }).publishReplay(1);
        this.clientObs.connect();
        this.client = redis.createClient(redisUrl);
        this.clientAsync = this.client;
        this.client.on("connect", () => {
            console.log("connected to redis server");
            var data = JSON.stringify({ "integerVal": 123456, "nested": { "Nested shit": [1, 2, "car"] } });
            console.log("Storing testing data");
            this.client.set("test_data", data, () => {
                console.log("saved");
                this.client.get("test_data", (err, dat) => {
                    console.log("Retrieved:", dat);
                });
            });
        });
    }
    createPlayerIfDoesNotExtist(playerData) {
        return this.clientAsync.hgetAsync(playersHashKey, playerData.id).then((fetchedP) => {
            if (!fetchedP) {
                console.log("Player does not exist creating", playerData);
                return this.clientAsync.hsetAsync(playersHashKey, playerData.id, JSON.stringify(playerData)).then(() => {
                    return new player_1.Player(playerData, this);
                });
            }
            else {
                console.log("Player with id", playerData.id, "exists");
                return new player_1.Player(fetchedP, this);
            }
        });
    }
    getPlayerById(id) {
        return this.clientAsync.hgetAsync(playersHashKey, id).then((pData) => {
            return new player_1.Player(pData, this);
        });
    }
    getPlayerByMatcher(matcher) {
        return this.clientAsync.hgetallAsync(playersHashKey).then((playersHash) => {
            console.log(playersHash);
            var players = _.values(playersHash);
            for (var i = 0; i < players.length; i++) {
                var player = new player_1.Player(players[i], this);
                if (matcher(player)) {
                    return player;
                }
            }
            return null;
        });
    }
    getPlayers() {
        return this.clientAsync.hgetallAsync(playersHashKey).then((playersHash) => {
            //console.log(playersHash)
            var players = _.values(playersHash);
            var pls = [];
            for (var i = 0; i < players.length; i++) {
                var player = new player_1.Player(players[i], this);
                pls.push(player);
            }
            return pls;
        });
    }
    get players() {
        return this.clientObs
            .flatMap((c) => Rx.Observable.fromPromise(c.hgetallAsync(playersHashKey)))
            .do(c => console.log(c))
            .map(playerHash => _.values(playerHash))
            .map(playerDatas => playerDatas.map(playerData => new player_1.Player(playerData, this)))
            .take(1);
    }
    get githubEvents() {
        console.log("github events requested");
        return this.clientObs
            .flatMap((c) => {
            console.log("Returning cGetAsync");
            return Rx.Observable.fromPromise(c.lrangeAsync(githubEventsHashKey, 0, 30))
                .map((eventJsonStrings) => {
                return eventJsonStrings.map((s) => JSON.parse(s));
            });
        })
            .take(1);
    }
    storeGithubEvent(event) {
        return this.clientObs.map(c => {
            c.lpush(githubEventsHashKey, JSON.stringify(event));
            c.ltrim(githubEventsHashKey, 0, 30);
            return event;
        });
    }
    savePlayer(player) {
        return this.clientAsync.hsetAsync(playersHashKey, player.data.id, JSON.stringify(player.data)).then(() => {
            console.log("Player", player.data.id, "saved");
            return player;
        });
    }
}
exports.Repository = Repository;
//# sourceMappingURL=repository.js.map