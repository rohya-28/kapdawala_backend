import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/config";
import userRouter from "./routes/userRouter"; // ✅ import your router
import adminRouter from "./routes/adminRouter";
import storeRouter from "./routes/storeOwnerRouter";
import endUserRouter from "./routes/endUserRouter";

const app = express();

// Enable CORS
app.use(cors({
  origin: config.frontEndDomain, 
}));


app.use(express.json());


app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Kapdewala API' });
});


app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter); 
app.use('/api/v1/store', storeRouter); 
app.use('/api/v1/endUser', endUserRouter); 


 
export default app;    
 