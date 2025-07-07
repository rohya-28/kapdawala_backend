import { config } from "./config/config";
import app from "./app"
import connectDb from "./config/db";

const startServer = async () => {
    
    await connectDb()

    const port = config.port || 3000 ;

    app.listen(port, () => {
        console.log(`Listening on Port: ${port}`);
         
    })
}

startServer();