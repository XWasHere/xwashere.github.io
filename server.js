const express = require("express");
const server = express();
const serverdir = process.cwd() + "/docs";

server.get("*", (req, res) => {
    res.sendFile(req.path, {
        root: serverdir
    });
});

server.listen(8080);