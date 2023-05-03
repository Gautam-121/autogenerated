const app = require("./app")
const dotenv =  require("dotenv")

dotenv.config({path : "backend/config/config.env"})

process.on("uncaughtException" , (err)=>{
    console.log(`Error is ${err.message}`)
    console.log("Shutting Down due to UncaughtException")

    process.exit(1)
})

const server = app.listen(process.env.PORT || 4000 , ()=>{
    console.log("Listening On Port", process.env.PORT || 3000)
} )

process.on("unhandledRejection", (err)=>{
    console.log(`Error is ${err.message}`)
    console.log("Shutting Down due to UncaughtException")

    server.close(()=>{
        process.emit(1)
    })
})

