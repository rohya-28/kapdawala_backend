import express from "express";
import { addService, deleteService, editService, getAllOrders, getInventory, getOrderDetails, getOrdersByStatus, updateStoreLocation } from "../controllers/inventory";
import { verifyStoreToken } from "../middleware/verifyStoreToken";
import { storeLogin } from "../controllers/user";

const storeRouter = express.Router();

//Store Owner Login
storeRouter.post('/storeLogin', storeLogin);

// Updating location
storeRouter.patch("/location", verifyStoreToken, updateStoreLocation);

// Add new service
storeRouter.get("/", verifyStoreToken, getInventory);
storeRouter.post("/add-service", verifyStoreToken, addService);
storeRouter.patch("/edit-service", verifyStoreToken, editService);
storeRouter.delete("/delete/:serviceId", verifyStoreToken, deleteService);


storeRouter.get("/orders", verifyStoreToken, getAllOrders);
storeRouter.get("/orders/new", verifyStoreToken, getOrdersByStatus("new"));
storeRouter.get("/orders/in-progress", verifyStoreToken, getOrdersByStatus("in-progress"));
storeRouter.get("/orders/completed", verifyStoreToken, getOrdersByStatus("completed"));
storeRouter.get("/orders/:orderId", verifyStoreToken, getOrderDetails);

export default storeRouter;
