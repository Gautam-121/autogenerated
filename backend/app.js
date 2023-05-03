const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")

app.use(cors())

app.use(express.json())
app.use(cookieParser())


//Import Route
const GoogleApiRouter = require("./route/googleApiRoute")

app.use("/", GoogleApiRouter)



module.exports = app