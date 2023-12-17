import { useEffect,useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';

import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetRazorpayKeyQuery,
  usePayOrderMutation,
} from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';
import logo from "../assets/logo2.png";
const OrderScreen = () => {
   const cart = useSelector((state) => state.cart);
   const dispatch = useDispatch();
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);

 



    const [key , setKey]  = useState('')
const [data, setData] = useState({});
const [prices, setPrices] = useState({});
const [dborders, setDborders] = useState([]);
 const [click, setClick] = useState(false);

  
  const placeOrderHandler = async () => {
 

  
    
       await payOrder({
         orderItems: order.orderItems,
         shippingAddress: order.shippingAddress,
         paymentMethod: order.paymentMethod,
         orderId
       }).then((x) => {
         console.log("x",x);
       if ( x.error &&  !x.error.data.success ) {
         toast.error(x.error.data.message);
       } else {
         setDborders(x.data.dbOrderItems);
         setPrices(x.data.prices);
         setData(x.data.order);
         setKey(x.data.key);
           dispatch(clearCartItems());
       }

      }).catch((err) => {
        console.log("error", err)
        toast.error(err.message); });
      }
useEffect(()=>{
  console.log("order",order)
order && console.log(order.paymentMethod);
   if (
     order &&
     !order.isPaid &&
     userInfo._id ===
       order.user._id && (order.paymentResult.attempts == 0 || click)
   )
     placeOrderHandler();
},[order])

  useEffect(() => {

 

 



  
    const options = {
      key,
      amount: data.amount,
      currency: "INR",
      name: "ProShop",
      description: "Test Payment Upi : success@razorpay",
      image: logo,
      order_id: data.id,
      callback_url: "http://localhost:5000/api/orders/payconfirm",
      prefill: {
        name: userInfo.name,
        email: userInfo.email,
      },
      notes: {
        address: "ProShop Corporate Office",
      },
      theme: {
        color: "#3c4c5d",
      },
    };
    console.log(options);

   if(key && (order.paymentResult.attempts == 0 || click)){
    setClick(false);
     const razor = new window.Razorpay(options);
      const x=  razor.open();
     
     
 
   }
   
 
  console.log("key", key, dborders);

  }, [key,data,isLoading]);


function formatAMPM(x) {
var date = new Date(x);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = "....... " +
    date.toString().split(" ")[0] +
    " ........ " +
    date.toString().split(" ")[1] +
    " " +
    date.toString().split(" ")[2] +
    " " +
    date.toString().split(" ")[3] +
    " ........ " +
    hours +
    ":" +
    minutes +
    " " +
    ampm 
    
    ;
  return strTime;
}


  const deliverHandler = async () => {
   const res= await deliverOrder(orderId);
   
   if (res.error ){ toast.error(res.error.data.message);} 
    refetch();
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error.data.message}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{" "}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">
                  Delivered on {formatAMPM(order.deliveredAt)}
                </Message>
              ) : (
                <Message variant="danger">Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">
                  {order.paymentResult.status === " paid"
                    ? "Paid on"
                    : "Refund on"}{" "}
                  {formatAMPM(order.paidAt)}
                </Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image.url}
                            alt={item.name.public_id}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>₹{order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>₹{order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>₹{order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>₹{order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  <div>
                    <div>
                      <Button on onClick={()=>{setClick(true); placeOrderHandler()}}>
                        {loadingPay ? <Loader /> : "Pay Now"}
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              )}

              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type="button"
                      className="btn btn-block"
                      onClick={deliverHandler}
                    >
                      {loadingDeliver ? <Loader /> : "Mark As Delivered"}
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
