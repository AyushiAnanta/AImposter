import mongoose from "mongoose";
import { db_name } from "../constants.js";


const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
        console.log(`\n mogodb connected !!! db host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("mongodb connection error", error);
        process.exit(1)
    }
}

export default connectDb
