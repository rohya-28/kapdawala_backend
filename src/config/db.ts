import { config } from "./config";
import mongoose from "mongoose";

const connectDb = async () => {
try {
    
    mongoose.connection.on('connected', () => {
        console.log("connected successfully");
    })
    
    mongoose.connection.on('error', (err) => {
        console.log("got error while connecting to database", err);
        
    })
    
    await mongoose.connect(config.databaseUrl as string);

} catch (error) {
    console.error("failed to connect", error);
    process.exit(1);
}
}

export default connectDb;