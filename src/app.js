import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middleware.js"
import { CORS_ORIGIN } from "./config/env.js"

export const app=express()


app.use(cors({
    origin:CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//import routes here
import healthcheckRoute from "./routes/healthcheck.route.js"
import userRoute from "./routes/user.route.js"
import subscriptionRoute from "./routes/subscription.route.js"
import videoRoute from "./routes/video.route.js"


//usedHere
app.use("/api/healthcheck",healthcheckRoute)
app.use("/api/user",userRoute)
app.use("/api/subscription",subscriptionRoute)
app.use("/api/video",videoRoute)


//Error Handler
app.use(errorHandler)