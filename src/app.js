import express from "express"
import cors from "cors"
import { CORS_ORIGIN } from "./config/env.js"
export const app=express()


app.use(cors({
    origin:CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16b"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))


//import routes here
import healthcheckRoute from "./routes/healthcheck.route.js"



//usedHere
app.use("/api/healthcheck",healthcheckRoute)