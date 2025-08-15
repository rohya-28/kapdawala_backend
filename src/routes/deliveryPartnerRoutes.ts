
import { Router } from 'express';
import { acceptOrder, getAvailableOrders } from '../controllers/deliveryPartner'; 
import { deliveryPartnerLogin } from '../controllers/user';


const deliveryRouter = Router();


deliveryRouter.post('/login',deliveryPartnerLogin );
deliveryRouter.get('/orders/available', getAvailableOrders);
deliveryRouter.patch("/orders/:orderId/accept", acceptOrder); 


export default deliveryRouter;