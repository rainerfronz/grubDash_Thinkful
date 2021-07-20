const { response } = require("express");
const { readlinkSync } = require("fs");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
//check to see if order exists middleware functions 
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    console.log(foundOrder)
    return next();
  }
  next({ status: 404, message: `Order does not exist: ${orderId}` });
}

function list(req, res) {
  res.json({ data: orders });
}
//check for deliver to 
function bodyHasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
     return next();
  }
  return next({ status: 400, message: "Order mush of a deliverTo" });
  
}
// mobile numbrer check
function bodyHasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
   return next();
  }
   
   return next({ status: 400, message: "Order must have a mobileNumber" });
  
}
//dish property check 
function bodyHasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes) {
    next();
  }
  next({ status: 400, message: "Order must have at least one dish" });
}
//array chcck using Array.isArray() method
function dishesIsAnArray(req, res, next) {
  const {data: { dishes } = {} } = req.body;
  if(Array.isArray(dishes)) {
    next()
  }
  next({ status: 400, 
        message:'Order must include at least one dish'})
}
//check if not empty Array by checking length of array
function dishNotEmptyArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes.length > 0) {
    next();
  }
  next({ status: 400, message: "Order must include at least one dish" });
}
// check quantity of array finding index of dish and checking vs quantity
// function dishesArrayQuantity(req, res, next) {
//   const { data: { dishes } = {} } = req.body;
//   const index = dishes.findIndex((dish) => !dish.quantity);
//   console.log(index, "line 87");
//   if (index != 0) {
//     next({
//       status: 400,
//       message: `Dish ${index} must have a quantity that is an integer greater than 0`,
//     });
//   }
//   next();
// }
// using findIndex to check if dish is Integer
// function dishesIsInteger(req, res, next) {
//   const { data: { dishes } = {} } = req.body;
//   const index = dishes.findIndex((dish) => !Number.isInteger(dish.quantity));
//   console.log(index, "lind 97");
//   if (index != -1) {
//     next({
//       status: 400,
//       message: `Dish ${index} must have a quantity that is an integer greater than 0`,
//     });
//   }
//   next();
// }
//OH assisted fancy mentored function creating a less confusing function using map amd a ternary
function dishesQuantityGreaterZero(req, res, next) {
  // const { data: { dishes } = {} } = req.body;
  const { data  = {} } = req.body;
  const message = data.dishes.map((ele, index) => ele.quantity && Number.isInteger(ele.quantity) ? null : `Dish ${index} must have a quantity that is an integer greater than 0`
  ).filter((errorMessage) => errorMessage !== null).join(",")
  if(message) {
   return next({ status: 400, message});
  }

  //remains of my previous function
  // const index = dishes.findIndex((dish) => dish.quantity < 0)
  // console.log(index, "line 107");
  // if (index != -1) {
  //   next({
  //     status: 400,
  //     message: `Dish ${index} must have a quantity that is an integer greater than 0`,
  //   });
  // }
  next();
}
//checks status
function dishStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status) {
     return next();
  }
  next({
    status: 400,
    message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
  });
}

//checks vif status if valid propoerty
function statusIsInvalid(req, res, next) {
  const { data: { status } = {} } = req.body;
  status === "pending" ||
  status === "preparing" ||
  status === "out-for-delivery"
    ? next()
    : next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
      });
}
//verify Id
function orderIdDoesNotMarch(req, res, next) {
  const { data: { id } = {} } = req.body;
  const order = res.locals.order;
  if (id === "" || id === null || id === undefined || id === order.id) {
    return next()
  } return next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${order.id}`,
  });
}
//create order function
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res) {
  // const order = res.locals.order;
  res.json({ data: res.locals.order });
}
//update order function get order(order.id)from response.locals.order
function update(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const order = res.locals.order;
  const updatedOrder = {
    id: order.id,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  res.json({ data: updatedOrder });
}
//delete/destroy cannot call delete- findindex splice 
function destroy(req, res, next) {
  const order = res.locals.order;
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1 && order.status === "pending") {
    orders.splice(index, 1);
  } else {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  }
  res.sendStatus(204);
}

module.exports = {
  create: [
    //needs
    bodyHasDeliverTo,
    bodyHasDishes,
    bodyHasMobileNumber,
    dishNotEmptyArray,
    dishesIsAnArray,
   
    dishesQuantityGreaterZero,
    
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    dishesIsAnArray,
    dishNotEmptyArray,
    dishesQuantityGreaterZero,
    dishStatus,
    statusIsInvalid,
    orderIdDoesNotMarch,
    
    
    update,
  ],
  list,
  delete: [orderExists, destroy],
};
