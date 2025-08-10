import express from "express";
import {  createOrder, getNearbyStores } from "../controllers/endUser";

const endUserRouter = express.Router();

endUserRouter.get("/nearby", getNearbyStores);
endUserRouter.post("/createOrder", createOrder);


export default endUserRouter;
