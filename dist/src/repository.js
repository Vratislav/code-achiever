var redis = require('redis');
var bluebird = require('bluebird');
var player_1 = require('./player');
var _ = require('underscore');
bluebird.promisifyAll(redis.RedisClient.prototype);
var playersHashKey = "CA.Players";
var Repository = (function () {
    function Repository(redisUrl) {
        var _this = this;
        this.client = redis.createClient(redisUrl);
        this.clientAsync = this.client;
        this.client.on("connect", function () {
            console.log("connected to redis server");
            var data = JSON.stringify({ "integerVal": 123456, "nested": { "Nested shit": [1, 2, "car"] } });
            console.log("Storing testing data");
            _this.client.set("test_data", data, function () {
                console.log("saved");
                _this.client.get("test_data", function (err, dat) {
                    console.log("Retrieved:", dat);
                });
            });
        });
    }
    Repository.prototype.createPlayerIfDoesNotExtist = function (playerData) {
        var _this = this;
        return this.clientAsync.hgetAsync(playersHashKey, playerData.id).then(function (fetchedP) {
            if (!fetchedP) {
                console.log("Player does not exist creating", playerData);
                return _this.clientAsync.hsetAsync(playersHashKey, playerData.id, JSON.stringify(playerData)).then(function () {
                    return new player_1.Player(playerData, _this);
                });
            }
            else {
                console.log("Player with id", playerData.id, "exists");
                return new player_1.Player(fetchedP, _this);
            }
        });
    };
    Repository.prototype.getPlayerById = function (id) {
        var _this = this;
        return this.clientAsync.hgetAsync(playersHashKey, id).then(function (pData) {
            return new player_1.Player(pData, _this);
        });
    };
    Repository.prototype.getPlayerByMatcher = function (matcher) {
        var _this = this;
        return this.clientAsync.hgetallAsync(playersHashKey).then(function (playersHash) {
            console.log(playersHash);
            var players = _.values(playersHash);
            for (var i = 0; i < players.length; i++) {
                var player = new player_1.Player(players[i], _this);
                if (matcher(player)) {
                    return player;
                }
            }
            return null;
        });
    };
    Repository.prototype.savePlayer = function (player) {
        return this.clientAsync.hsetAsync(playersHashKey, player.data.id, JSON.stringify(player.data)).then(function () {
            console.log("Player", player.data.id, "saved");
            return player;
        });
    };
    return Repository;
})();
exports.Repository = Repository;
//# sourceMappingURL=repository.js.map