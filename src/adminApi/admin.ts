import express = require('express');
import {mountPlayerRoutes} from './players'
import {mountGithubRoutes} from './github'
import {Repository} from '../repository'
import {AdminContext} from './adminShared'

export function mountAdminRoutes(ctx : AdminContext){
    //Check for admin token, if not found, issue a warning
    if(!ctx.adminToken){
        console.warn("Warning: no ADMIN_TOKEN environment variable set. The admin API is unprotected!");
    }
    [
        mountPlayerRoutes,
        mountGithubRoutes
    ].map((mount) => mount(ctx))
}


