"use strict";
const rxjs_1 = require("rxjs");
class Player {
    constructor(data, repository) {
        if (typeof (data) == "string") {
            data = JSON.parse(data);
        }
        this.data = data;
        this.repo = repository;
    }
    get name() {
        if (this.data.slackName) {
            return this.data.slackName;
        }
        if (this.data.githubName) {
            return this.data.githubName;
        }
        return this.data.id;
    }
    get type() {
        return "PLAYER";
    }
    get metrics() {
        return this.data.metrics;
    }
    get achievments() {
        return this.data.achievments;
    }
    save() {
        return this.repo.savePlayer(this);
    }
    obsSave() {
        return rxjs_1.Observable.fromPromise(this.save);
    }
    get debugInfo() {
        return `id: ${this.data.id} githubName: ${this.data.githubName} slackName: ${this.data.slackName}`;
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map