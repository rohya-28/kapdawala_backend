
import { Router } from 'express';
import { getAvailableOrders } from '../controllers/deliveryPartner'; 
import { deliveryPartnerLogin } from '../controllers/user';


const deliveryRouter = Router();


deliveryRouter.post('/login',deliveryPartnerLogin );
deliveryRouter.get('/orders/available', getAvailableOrders);

export default deliveryRouter;