"use strict";
function verifyAdminTokenOrDie(adminToken) {
    return (req, res, next) => {
        const sentToken = req.headers['access-token'];
        if (adminToken && sentToken != adminToken) {
            res.status(403).send({ 'error': "Forbidden" }).end();
        }
        else {
            next();
        }
    };
}
exports.verifyAdminTokenOrDie = verifyAdminTokenOrDie;
//# sourceMappingURL=adminShared.js.map