/// <reference path="../node_modules/axios/axios" />

import {Config} from './config'
import {Achiever} from './achiever'
import {Achievment} from './achievments'
import axios = require('axios')
export class Announcer{
	config : Config
	constructor(config : Config){
		this.config = config;
		
	}
	
	
	announceAchievment(achiever:Achiever,achievment:Achievment,token?:string){
		console.log('Anonnouncing achievment',achievment.id)
		axios.post(this.config.slackWebhookUrl,{
			"fallback":achievment.name,
			"username" : "Achievements",
			"channel":"@"+achiever.name,
			"icon_url" : "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Twemoji_1f3c6.svg/256px-Twemoji_1f3c6.svg.png",
			"attachments": [
				{
					"pretext" : achiever.name + " has earned achievement:",
					"title" : achievment.name,
					"text" : achievment.description,
					"image_url" : achievment.imageUrl
				}
			]
		}).catch((err)=>{
			console.error(err);
		});
	}
	
	
	
}