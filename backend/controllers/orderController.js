import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { calcPrices } from "../utils/calcPrices.js";


// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod , paymentResult } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    //  here we must assume that the prices from our client are incorrect.
    // We must only trust the price of the item as it exists in
    // our DB. This prevents a user paying whatever they want by hacking our client
    // side code 

    // get the ordered items from our database

    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });
    
    // map over the order items and use the price from our items from database
    const dbOrderItems = orderItems.map((itemFromClient) => {
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
    
   
  
    
    // calculate prices
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentResult: {
        id: "",
        status: "",
        update_time: "",
        email_address: "",
        attempts : "0"
      },
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to shippped
// @route   GET /api/orders/:id/ship
// @access  Private/Admin
const updateOrderToShip = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
 
  if (order) {

  if(order.paymentResult.status === ' paid') {

    await order.orderItems.forEach(async (element) => {
      const updatedStock = await Product.findById(element._id);
     
      if (updatedStock.countInStock - element.qty >= 0) {
        updatedStock.countInStock = updatedStock.countInStock - element.qty;
        await updatedStock.save();
       
      } else {
        res.status(400);
        throw new Error(`${updatedStock.name} Gone Out Of Stock `);
      }
       order.isShipped = true;
       order.shippedAt = Date.now();

       const updatedOrder = await order.save();

       res.json(updatedOrder);
    });

    }
    else {
      res.status(400);
      throw new Error("User gets Refund");
    }
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});
// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
 
  if (order) {
  if(order.paymentResult.status === ' paid') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    
    const updatedOrder = await order.save();

    res.json(updatedOrder);}
    else {
      res.status(400);
      throw new Error("User gets Refund");
    }
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});
// @desc    Update order to cancel
// @route   GET /api/orders/:id/cancel
// @access  Private
const updateOrderToCancel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
 
  if (order) {
  if(!order.isShipped) {
    order.isCancel = true;
    order.cancelAt = Date.now();
    
    const updatedOrder = await order.save();

    res.json(updatedOrder);}
    else {
      res.status(400);
      throw new Error("not Cancel after Shipped");
    }
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  updateOrderToShip,
  updateOrderToCancel,
  getOrders,
};
