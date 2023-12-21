import crypto from "crypto";

import Product from "../models/productModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import Order from "../models/orderModel.js";
import Razorpay from 'razorpay'
import asyncHandler from "../middleware/asyncHandler.js";
export const newPayment = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, orderId } = req.body;
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});
 
    if (orderItems && orderItems.length === 0) {
     
    res.status(400);
    throw new Error("No order items");
   
  } else {
    // NOTE: here we must assume that the prices from our client are incorrect.
    // We must only trust the price of the item as it exists in
    // our DB. This prevents a user paying whatever they want by hacking our client
    // side code - https://gist.github.com/bushblade/725780e6043eaf59415fbaf6ca7376ff

    // get the ordered items from our database
    
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });
   
    const dbOrderItems = orderItems.map((itemFromClient) => {
      // console.log(itemFromClient)
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );
     
      if (matchingItemFromDB.countInStock - itemFromClient.qty < 0) {
        res.status(400);
        throw new Error("Not enough stock");
      }
     
      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        qty: itemFromClient.qty,
      };
    });

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    const options = {
      amount: Number(totalPrice) * 100,
      currency: "INR",
    };
    console.log("Total");
   await instance.orders.create(options).then( async (order) => {
     
    const or = await Order.findById(orderId);
    let data;
    console.log(or.paymentResult.attempts)
  
      console.log("Payment");
      data = {
      id: order.id,
      status: "not paid",
      update_time: Date.now(),
      email_address: "",
      attempts: or.paymentResult.attempts + 1,
    };
   
   console.log(data)
    or.paymentResult = data;
   const orr= await or.save();
   console.log("orr",orr.paymentResult)
    res.status(200).json({
      success: true,
      dbOrderItems,
      order,
      key: process.env.RAZORPAY_API_KEY,
      prices: { itemsPrice, taxPrice, shippingPrice, totalPrice },
    });
   }).catch(err => {
    
     res.status(500).send({
       message: err,
       success: false,
     });
   });
   
  }
  

});

export const checkStatus = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
    console.log(req.body);
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
 const order = await Order.findOne({
   "paymentResult.id": razorpay_order_id,
 }).populate("user");
 console.log(order);
if(order) {
 const id = order.user.email;
 console.log(order);
  if (isAuthentic) {

    await order.orderItems.forEach(async (element) => {
      const updatedStock = await Product.findById(element._id);
      console.log("updatedStock", updatedStock.countInStock - element.qty);
      if (updatedStock.countInStock - element.qty >= 0){
        updatedStock.countInStock = updatedStock.countInStock - element.qty;
      await updatedStock.save();
const dataaa = {
  id: razorpay_order_id,
  status: " paid",
  update_time: Date.now(),
  email_address: id,
  attempts: order.paymentResult.attempts 
};
order.paymentResult = dataaa;
order.isPaid = true;
order.paidAt = Date.now();
await order.save();

res.redirect(`/order/${order._id}`);
 
      
      }

        else {
          const dataa = {
            id: razorpay_order_id,
            status: "outOfStock",
            update_time: Date.now(),
            email_address: id,
            attempts: order.paymentResult.attempts 
          };
          order.paymentResult = dataa;
          order.isPaid = true;
          order.paidAt = Date.now();
          await order.save();

          res.redirect(`/order/${order._id}`);
 
        }
         
      // else {
      //   err = 1;
      // }
      //  console.log(err);
    });
  
     }
  
  else {
 const data = {
   id: razorpay_order_id,
   status: "notAuthorized",
   update_time: Date.now(),
   email_address: id,
   attempts: order.paymentResult.attempts 
 };
 order.paymentResult = data;
 order.isPaid = true;
 order.paidAt = Date.now();
 await order.save();

 res.redirect(`/order/${order._id}`);
 
  }}
};

