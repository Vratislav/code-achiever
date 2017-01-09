import express = require('express');
import {Repository} from '../repository'
import {AdminContext,verifyAdminTokenOrDie} from './adminShared'
import {PlayerData} from '../player'
import Rx = require('rxjs')
import {logAndEnd} from '../utils'


export function mountGithubRoutes(context : AdminContext){
    context.app.get('/api/v1/github/events',
     verifyAdminTokenOrDie(context.adminToken),
     (request, response : express.Response) => {
        context.repostirory.githubEvents.subscribe((events)=>{
            response.json(200,events);
        },logAndEnd(response),()=>{console.log("Github events fetch completed")});
    });
}