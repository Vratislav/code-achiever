var Player = (function () {
    function Player(data, repository) {
        if (typeof (data) == "string") {
            data = JSON.parse(data);
        }
        this.data = data;
        this.repo = repository;
    }
    Object.defineProperty(Player.prototype, "name", {
        get: function () {
            if (this.data.slackName) {
                return this.data.slackName;
            }
            if (this.data.githubName) {
                return this.data.githubName;
            }
            return this.data.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "type", {
        get: function () {
            return "PLAYER";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "metrics", {
        get: function () {
            return this.data.metrics;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "achievments", {
        get: function () {
            return this.data.achievments;
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.save = function () {
        return this.repo.savePlayer(this);
    };
    return Player;
})();
exports.Player = Player;
//# sourceMappingURL=player.js.map