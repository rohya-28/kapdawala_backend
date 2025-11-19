import express from "express";
import {  createOrder, getAllOrders, getNearbyStores } from "../controllers/endUser";

const endUserRouter = express.Router();

endUserRouter.get("/nearby", getNearbyStores);
endUserRouter.post("/createOrder", createOrder);
endUserRouter.get("/getAllMyOrders", getAllOrders);



export default endUserRouter;
