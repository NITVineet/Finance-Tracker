import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

const connectToDB = async () => {
    console.log(`${process.env.MONGODB_URI}/${DB_NAME}`)
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Connected to MongoDB : ${connectionInstance.connections[0].name}`);
    } catch (error) {
        console.log("MongoDB connection failed :", error);
        process.exit(1);
    }
}
export default connectToDB;