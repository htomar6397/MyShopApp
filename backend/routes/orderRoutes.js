import express from "express";
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
 
  updateOrderToDelivered,
  updateOrderToShip,
  updateOrderToCancel,
  getOrders,
} from "./../controllers/orderController.js";
import { protect, admin } from "./../middleware/authMiddleware.js";
import { checkStatus, newPayment } from "./../controllers/phoneController.js";

router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);
router.route("/myorders").get(protect, getMyOrders);
router.route("/:id").get(protect, getOrderById);
router.route("/pay").post(protect, newPayment);
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);
router.route("/:id/ship").put(protect, admin, updateOrderToShip);
router.route("/:id/cancel").put(protect, admin, updateOrderToCancel);
router.route("/payconfirm").post(protect, checkStatus)
export default router;
