// src/routes/admin.route.ts
import express from 'express';
import {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  toggleStoreSuspension,
  
} from '../controllers/store';
import { validateStoreId } from '../middleware/store';
import { adminLogin, updateAdminPassword } from '../controllers/user';
import { verifyAdmin } from '../middleware/admin';

import {
  getAllDeliveryPartners,
  addDeliveryPartner,
  getPartnerById,
  updatePartner,
  deletePartner
} from '../controllers/deliveryPartner';
import { addPromotion, applyPromotion, getAllPromotions } from '../controllers/promotions';


const adminRouter = express.Router();

//  adminRouter.use(verifyAdmin); 

// Login 
adminRouter.post('/login', adminLogin);
adminRouter.patch('/updatePassword', updateAdminPassword);

// admin store manages
adminRouter.post('/stores', createStore);
adminRouter.get('/stores', getAllStores);
adminRouter.get('/stores/:id', validateStoreId, getStoreById); 
adminRouter.patch('/stores/:id', validateStoreId, updateStore);
adminRouter.delete('/stores/:id', validateStoreId, deleteStore);

adminRouter.patch('/stores/:id/suspend', toggleStoreSuspension);

// store owner add services c
// adminRouter.post('/services', verifyStoreToken, addServices);


//  Delivery Partner
adminRouter.get('/delivery', getAllDeliveryPartners);
adminRouter.post('/delivery', addDeliveryPartner);
adminRouter.get('/delivery/:partnerId', getPartnerById);
adminRouter.patch('/delivery/:partnerId', updatePartner);
adminRouter.delete('/delivery/:partnerId', deletePartner);

// Promotions
adminRouter.get('/promotions', getAllPromotions);
adminRouter.post('/promotions/add-offer', addPromotion);
adminRouter.post('/promotions/apply-promotion', applyPromotion);



export default adminRouter; 
