"use strict";
const adminShared_1 = require("./adminShared");
const utils_1 = require("../utils");
function mountGithubRoutes(context) {
    context.app.get('/api/v1/github/events', adminShared_1.verifyAdminTokenOrDie(context.adminToken), (request, response) => {
        context.repostirory.githubEvents.subscribe((events) => {
            response.json(200, events);
        }, utils_1.logAndEnd(response), () => { console.log("Github events fetch completed"); });
    });
}
exports.mountGithubRoutes = mountGithubRoutes;
//# sourceMappingURL=github.js.map