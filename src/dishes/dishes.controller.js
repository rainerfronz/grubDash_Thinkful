const { DH_NOT_SUITABLE_GENERATOR } = require("constants");
const path = require("path");
// const dishes = require("../data/dishes-data")

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// validation keys
// name - exists
// description - exists
// price - exists and greater than 0 and it a number
// image_url-  exists

//validates body and dishId
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id does not exist: ${dishId}`,
  });
}

function confirmName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
     return next();
  }
   return next({
    status: 400,
    message: `A name property is required`,
  });
}

function confirmDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
     return next();
  }
   return next({
    status: 400,
    message: `A description property is required`,
  });
}

function confirmPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price && price > 0 && typeof price === "number") {
     return next();
  }
   return next({
    status: 400,
    message: `A price property is required`,
  });
}

function confirmImageUrl(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
     return next();
  }
   return next({
    status: 400,
    message: `A image_url property is requited`,
  });
}

//create function use newId/nextId() for new id of dish
//create function use newId/nextId() for new id of dish
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  // const dish = res.locals.dish;
  res.json({ data: res.locals.dish });
}

function list(req, res) {
  res.json({ data: dishes });
}

// function dishIdConfirm(req, res, next) {
//         const { dishId } = req.params;
//         const foundDish = dishes.find((dish) => dish.id === dishId);
//         if(foundDish) {
//             res.locals.dish = foundDish;
//             return next();
//         }
//          return next({
//             status: 404,
//             message: `Dish id does not exist: ${dishId}`,
//         })
//     }

function update(req, res, next) {
  
  let dish = res.locals.dish;
  const originalId = dish.id;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (originalId === id || !id) {
    const updatedDish = {
        id: dish.id,
        name,
        description,
        price,
        image_url
    }
    dish = updatedDish
    res.json({ data: dish })
}
next({ 
    status: 400, 
    message: `Dish id does not match route id. Dish: ${id}, Route: ${originalId}`
 })
}


module.exports = {
  create: [
    confirmName,
    confirmDescription,
    confirmPrice,
    confirmImageUrl,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    confirmName,
    confirmDescription,
    confirmPrice,
    confirmImageUrl,
    // dishIdConfirm,
    update,
  ],
  
  list,
};

