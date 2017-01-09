import express = require('express');
import {Repository} from '../repository'
import {AdminContext,verifyAdminTokenOrDie} from './adminShared'
import {PlayerData} from '../player'
import Rx = require('rxjs')


export function mountPlayerRoutes(context : AdminContext){
    context.app.get('/api/v1/players',
     verifyAdminTokenOrDie(context.adminToken),
     (request, response : express.Response) => {
        console.log("Got request for players");
        context.repostirory.players.map(pls => pls.map(p => p.data)).subscribe((players)=>{
            response.json(200,players);
        },()=>{},()=>{console.log("Player fetch completed")});
    });

    context.app.get('/api/v1/players/:playerId',
        verifyAdminTokenOrDie(context.adminToken),
        (request, response : express.Response) => {
            const playerId = request.params.playerId
            Rx.Observable.fromPromise(context.repostirory.getPlayerById(playerId))
            .map((p) => p.data).subscribe((playerData)=>{
                response.json(200,playerData);
            })
        });

    context.app.put('/api/v1/players/:playerId',
        verifyAdminTokenOrDie(context.adminToken),
        (request, response : express.Response) => {
            const playerId = request.params.playerId
            Rx.Observable.fromPromise(context.repostirory.getPlayerById(playerId))
            .flatMap((player)=> {
                    var newData = request.body as PlayerData
                    player.data.slackName = newData.slackName;
                    return Rx.Observable.fromPromise(player.save())
            }).map((p) => p.data).subscribe((playerData)=>{
                response.json(200,playerData);
            })
        });

    context.app.post('/api/v1/players/:playerId/reset',
        verifyAdminTokenOrDie(context.adminToken),
        (request, response : express.Response) => {
            const playerId = request.params.playerId
            Rx.Observable.fromPromise(context.repostirory.getPlayerById(playerId))
            .flatMap((player)=> {
                    var newData = request.body as PlayerData
                    player.data.achievments = {};
                    player.data.metrics = {};
                    return Rx.Observable.fromPromise(player.save())
            }).map((p) => p.data).subscribe((playerData)=>{
                response.json(200,playerData);
            })
        });

}
//{app, repository} : {app : express.Express, repository : Repository}