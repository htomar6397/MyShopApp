import asyncHandler from "./../middleware/asyncHandler.js";
import Product from "./../models/productModel.js";
import cloudinary from 'cloudinary'
import formidable from 'formidable'

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 3;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  // NOTE: checking for valid ObjectId to prevent CastError moved to separate
  // middleware. See README for more info.

  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    // NOTE: this will run if a valid ObjectId but no product was found
    // i.e. product may be null
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const form = formidable({});
    
   
   
      const  fields = await form.parse(req);
     const { name, price, description, image, brand, category, countInStock} =
       fields[0];
  
        
      let imageLink;
         await cloudinary.v2.uploader.upload(image[0], {
      folder: "products",
    },function (error, result) {
       console.log(error); 
      if(error){ res.status(404);
       throw new Error(error.message);}
        imageLink = {
     public_id: result.public_id,
     url: result.secure_url,

   }

     })
  

  const product = new Product({
    name: name[0],
    price: price[0],
    user: req.user._id,
    image: imageLink,
    brand: brand[0],
    category: category[0],
    countInStock: countInStock[0],
   
    description: description[0],
  });

  const createdProduct = await product.save();
  
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

let imageLink=image;
if(typeof image === 'string') {
 await cloudinary.v2.uploader.upload(
     image,
     {
       folder: "products",
     },
     function (error, result) {
      
      if(error){ res.status(404);
       throw new Error(error.message);}
        imageLink = {
     public_id: result.public_id,
     url: result.secure_url,

   }

     }
   );
   }
  const product = await Product.findById(req.params.id);
 if (typeof image === "string") {
   await cloudinary.v2.uploader.destroy(product.image.public_id);
 }
  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = imageLink || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
   
  if (product) {
       await cloudinary.v2.uploader.destroy(product.image.public_id);
    await Product.deleteOne({ _id: product._id });
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
     
    if (alreadyReviewed) {
    const index = product.reviews.indexOf(alreadyReviewed);
    
    product.reviews[index].rating = Number(rating);
    product.reviews[index].comment = comment;
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    await product.save();
       res.status(201).json({ message: "Review updated" });
    
    }
    else
  {  const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  }
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
};
