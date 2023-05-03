const express = require("express")
const router =  express.Router()
const login =  require("../controller/loginAuth")
const getAllMessages = require("../controller/getAllMessages")

router.route("/signup").get(login)

router.route("/getAllMessages").get(getAllMessages)


module.exports = router