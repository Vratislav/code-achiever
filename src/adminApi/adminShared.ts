import express = require('express');
import {Repository} from '../repository'

export interface AdminContext{
    app : express.Express,
    repostirory : Repository,
    adminToken : string
}

export function verifyAdminTokenOrDie(adminToken:string) : (req : express.Request, res : express.Response, next:any) => void{
    return  (req : express.Request, res : express.Response, next:any) => {
        const sentToken = req.headers['access-token'];
        if(adminToken && sentToken != adminToken){
             res.status(403).send({'error':"Forbidden"}).end();
        }else{
            next();
        }
    }
}