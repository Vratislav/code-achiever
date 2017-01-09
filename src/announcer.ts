
import {Config} from './config'
import {Achiever} from './achiever'
import {Player} from './player'
import {Achievment} from './achievments'
import axios = require('axios')

export class Announcer{
	config : Config
	constructor(config : Config){
		this.config = config;

	}


	announceAchievment(achiever:Player,achievment:Achievment,token?:string){
		if(!this.config.slackWebhookUrl){
			console.error("Cannot announce achievement. SLACK_WEBHOOK_URL ENV variable is not set!");
			return;
		}
		if(!achiever.data.slackName){
			console.error(`Cannot announce achievement for ${achiever.name}! No slackName defined!`);
			return;
		}
		console.log('Anonnouncing achievment',achievment.id)
		axios.post(this.config.slackWebhookUrl,{
			"fallback":achiever.data.slackName,
			"username" : "Achievements",
			"channel":"@"+achiever.data.slackName,
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