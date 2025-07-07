import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/config";
import userRouter from "./routes/userRouter"; // ✅ import your router

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




export default app;   
 