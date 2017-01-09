"use strict";
const adminShared_1 = require("./adminShared");
const Rx = require("rxjs");
function mountPlayerRoutes(context) {
    context.app.get('/api/v1/players', adminShared_1.verifyAdminTokenOrDie(context.adminToken), (request, response) => {
        console.log("Got request for players");
        context.repostirory.players.map(pls => pls.map(p => p.data)).subscribe((players) => {
            response.json(200, players);
        }, () => { }, () => { console.log("Player fetch completed"); });
    });
    context.app.get('/api/v1/players/:playerId', adminShared_1.verifyAdminTokenOrDie(context.adminToken), (request, response) => {
        const playerId = request.params.playerId;
        Rx.Observable.fromPromise(context.repostirory.getPlayerById(playerId))
            .map((p) => p.data).subscribe((playerData) => {
            response.json(200, playerData);
        });
    });
    context.app.put('/api/v1/players/:playerId', adminShared_1.verifyAdminTokenOrDie(context.adminToken), (request, response) => {
        const playerId = request.params.playerId;
        Rx.Observable.fromPromise(context.repostirory.getPlayerById(playerId))
            .flatMap((player) => {
            var newData = request.body;
            player.data.slackName = newData.slackName;
            return Rx.Observable.fromPromise(player.save());
        }).map((p) => p.data).subscribe((playerData) => {
            response.json(200, playerData);
        });
    });
    context.app.post('/api/v1/players/:playerId/reset', adminShared_1.verifyAdminTokenOrDie(context.adminToken), (request, response) => {
        const playerId = request.params.playerId;
        Rx.Observable.fromPromise(context.repostirory.getPlayerById(playerId))
            .flatMap((player) => {
            var newData = request.body;
            player.data.achievments = {};
            player.data.metrics = {};
            return Rx.Observable.fromPromise(player.save());
        }).map((p) => p.data).subscribe((playerData) => {
            response.json(200, playerData);
        });
    });
}
exports.mountPlayerRoutes = mountPlayerRoutes;
//{app, repository} : {app : express.Express, repository : Repository} 
//# sourceMappingURL=players.js.map