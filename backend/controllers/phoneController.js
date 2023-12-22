import crypto from "crypto";
import Order from "../models/orderModel.js";
import Razorpay from 'razorpay'
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    payment
// @route   GET /api/orders/pay
// @access  Private
export const newPayment = asyncHandler(async (req, res) => {
    const {  orderId } = req.body;
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});
 
    const orDer = await Order.findById(orderId);
      
    const options = {
      amount: Number(orDer.totalPrice) * 100,
      currency: "INR",
    };
   
   await instance.orders.create(options).then( async (order) => {
     
    
   
     const data = {
      id: order.id,
      status: "not paid",
      update_time: Date.now(),
      email_address: "",
      attempts: orDer.paymentResult.attempts + 1,
    };
   
  
    orDer.paymentResult = data;
    await orDer.save();

    res.status(200).json({
      success: true,
    
      order,
      key: process.env.RAZORPAY_API_KEY,
      
    });
   }).catch(err => {
    
     res.status(500).send({
       message: err,
       success: false,
     });
   });
   
  }
  

);

// @desc   confirm payment
// @route   GET /api/orders/payconfirm
// @access  Private
export const checkStatus = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
   
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
 const order = await Order.findOne({"paymentResult.id": razorpay_order_id,}).populate("user");
 
     if(order) {
       const id = order.user.email;
 
 const data = {
   id: razorpay_order_id,
   status: isAuthentic? " paid":"notAuthorized",
   update_time: Date.now(),
   email_address: id,
   attempts: order.paymentResult.attempts 
 };
 order.paymentResult = data;
 order.isPaid = true;
 order.paidAt = Date.now();
 await order.save();

  res.redirect( process.env.ENVIROMENT==="development"?`http://localhost:3000/order/${order._id}`:`/order/${order._id}`);
 
  }
};

