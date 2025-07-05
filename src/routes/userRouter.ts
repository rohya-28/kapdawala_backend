import express from 'express';
import { signup, signIn } from '../controllers/user';

const userRouter = express.Router();

userRouter.post('/signUp', signup);
userRouter.post('/signIn', signIn);

export default userRouter;
