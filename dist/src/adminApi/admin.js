"use strict";
const players_1 = require("./players");
const github_1 = require("./github");
function mountAdminRoutes(ctx) {
    //Check for admin token, if not found, issue a warning
    if (!ctx.adminToken) {
        console.warn("Warning: no ADMIN_TOKEN environment variable set. The admin API is unprotected!");
    }
    [
        players_1.mountPlayerRoutes,
        github_1.mountGithubRoutes
    ].map((mount) => mount(ctx));
}
exports.mountAdminRoutes = mountAdminRoutes;
//# sourceMappingURL=admin.js.map