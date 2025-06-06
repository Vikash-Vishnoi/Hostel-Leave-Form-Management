// 403 Forbidden Error Handler
function handle403Error(error, req, res, next) {
    res.status(403).render("error/403", { error: "403 Forbidden" });
}


// 404 Internal Server Error Handler
function handle404Error(err, req, res, next) {
    res.status(404).render("error/404");
}


export default {
    handle403Error,
    handle404Error,
};