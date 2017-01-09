"use strict";
const axios = require("axios");
class Announcer {
    constructor(config) {
        this.config = config;
    }
    announceAchievment(achiever, achievment, token) {
        if (!this.config.slackWebhookUrl) {
            console.error("Cannot announce achievement. SLACK_WEBHOOK_URL ENV variable is not set!");
            return;
        }
        if (!achiever.data.slackName) {
            console.error(`Cannot announce achievement for ${achiever.name}! No slackName defined!`);
            return;
        }
        console.log('Anonnouncing achievment', achievment.id);
        axios.post(this.config.slackWebhookUrl, {
            "fallback": achiever.data.slackName,
            "username": "Achievements",
            "channel": "@" + achiever.data.slackName,
            "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Twemoji_1f3c6.svg/256px-Twemoji_1f3c6.svg.png",
            "attachments": [
                {
                    "pretext": achiever.name + " has earned achievement:",
                    "title": achievment.name,
                    "text": achievment.description,
                    "image_url": achievment.imageUrl
                }
            ]
        }).catch((err) => {
            console.error(err);
        });
    }
}
exports.Announcer = Announcer;
//# sourceMappingURL=announcer.js.map