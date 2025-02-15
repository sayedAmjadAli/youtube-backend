import mongoose from "mongoose";
import { MONGODB_URL } from "./env.js";
import { DB_NAME } from "../constant.js";

const database=async ()=>{
    try {
        const connection=await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`)
        console.log(`\nMONGODB Connected HOSTNAME :${connection.connection.host}`)
    } catch (error) {
        console.log("mongodb connection ERROR: ",error)
        process.exit(1)
    }
}

export default database