import express from "express";
var app = express();
app.get("/", function(req, res) {
    res.send("Hello World!");
});
app.listen(3004, function() {
    console.log("Example app listening on port 3004!!!");
});
export default app;
