/// <reference path="../node_modules/axios/axios" />
var axios = require('axios');
var Announcer = (function () {
    function Announcer(config) {
        this.config = config;
    }
    Announcer.prototype.announceAchievment = function (achiever, achievment, token) {
        console.log('Anonnouncing achievment', achievment.id);
        axios.post(this.config.slackWebhookUrl, {
            "fallback": achievment.name,
            "username": "Achievements",
            "channel": "#code-achiever",
            "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Twemoji_1f3c6.svg/256px-Twemoji_1f3c6.svg.png",
            "attachments": [
                {
                    "pretext": achiever.name + " has earned achievement:",
                    "title": achievment.name,
                    "text": achievment.description,
                    "image_url": achievment.imageUrl
                }
            ]
        }).catch(function (err) {
            console.error(err);
        });
    };
    return Announcer;
})();
exports.Announcer = Announcer;
//# sourceMappingURL=announcer.js.map