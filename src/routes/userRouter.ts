import express from 'express';
import { signup, signIn } from '../controllers/user';
import { loginLimiter } from '../middleware/security/rateLimiter';

const userRouter = express.Router();

userRouter.post('/signUp', signup);
userRouter.post('/signIn',loginLimiter, signIn);




export default userRouter;
