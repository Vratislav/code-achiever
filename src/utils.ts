import Rx = require('rxjs')
import {Observable} from 'rxjs'
import express = require('express')

export function createObservable<T>(obsFunction : (observable : Rx.Observer<T>) => void ) : Rx.Observable<T>{
	return Rx.Observable.create(obsFunction);
}

export function logError(error : any){
	console.log(`Got error: ${error}`);
	if(error.stack){
		console.log('Stack:')
		console.log(error.stack)
	}
}

export function logAndThrow(error:any){
	logError(error);
	throw error;
}

export function logAndEnd(res : express.Response) : (error:any)=>void{
	return (error:any) => {
		logError(error);
		res.status(500).end();
	}
}

