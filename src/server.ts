import {Config} from './config'
import express = require('express');
var bodyParser = require('body-parser')
var colors = require('colors/safe');

export class Server{
	app : express.Express;
	config : Config
	private listener : any;
	
	constructor(config : Config){
		this.config = config;
		this.app = express();
		this.configureMiddleware();
		this.configureRoutes();
	}
	
	
	
	start():void{
		this.listener = this.app.listen(this.config.port);
		
		console.log(colors.green("CodeAchiever is running on port " + this.config.port));
	}
	
	stop():void{
		if(this.listener){
			this.listener.close();
		}
		console.log("Code achiever server stopped.")
	}
	

	private configureMiddleware(){
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(bodyParser.json());
	}
	
	private configureRoutes(){
		var app = this.app;
		app.post('/github/hook',
			(req,resp)=>{
				console.log("Recieved on /github/hook:");
				console.log(req.body);
				resp.sendStatus(200);
			});
	}
	




	
	
	
	
}







