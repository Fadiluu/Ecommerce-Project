var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
const userHelper = require('../helpers/user-helpers');
const { response, render } = require('../app');

// function that verifies wether a user is loggedIn by checking the session 
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/',async(req, res)=>{
  let user= req.session.user
  cartCount=null  
  if(req.session.user){
    cartCount= await userHelper.getCartCount(req.session.user._id)
  }
  
  products = await productHelper.getAllProducts()
  res.render('user/view-products',{user,products,cartCount});
  
});

// load signup page
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
//Register account
router.post('/signup',async(req,res)=>{
  // First check wether user with this email  id exists
  email=req.body.Email
  userExists= await userHelper.checkUserExists(email)
  if(userExists){
    signupError="An account with this Email has already been registered"
    res.render('user/signup',{signupError})
  }else{
    // If no user with this email exists add it to database and registed account
    userHelper.doSignup(req.body).then(()=>{
      res.redirect('/')
    })
  }

})


// load login page
router.get('/login',(req,res)=>{
  res.render('user/login')
})

//login user
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.userLoggedIn=true
      res.redirect('/')
    }else{
      res.render('user/login',{response})

    }
  })

})

//loggin out
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})

// loading cart page
router.get('/cart',verifyLogin,async(req,res)=>{
  //checking first if the user have cart if so just loading it or else creating a cart for user with  user id
  total=0
  cartProducts = await userHelper.getCart(req.session.user._id)
  console.log(cartProducts)
  if(cartProducts.length>0){
    total = await userHelper.getTotalAmount(req.session.user._id)
  }
  res.render('user/cart',{cartProducts,user:req.session.user,total})
})

//adding item to cart (request using ajax)
router.get('/add-product-cart/:id',(req,res)=>{
  proId=req.params.id
  userHelper.addToCart(req.session.user._id,proId).then((response)=>{
    res.json({status:true})
  })
})

//removing products from cart regardless of quantity
router.get('/remove-product/:proId/:cartId',(req,res)=>{
  proId = req.params.proId
  cartId = req.params.cartId
  userHelper.removeCartItem(cartId,proId).then((response)=>{
    res.redirect('/cart')
  })
})

//change item quantity
router.post('/change-quantity',(req,res)=>{ 
  userHelper.changeItemQuantity(req.body).then(async(response)=>{
    // response.total=0
    response.total=await userHelper.getTotalAmount(req.body.userId)
    res.json(response)
  })
})

//loading place order page
router.get('/place-order',verifyLogin,async(req,res)=>{
  total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{user:req.session.user,total})
})

router.post('/place-order',async(req,res)=>{
  // getting the product list 
  products = await userHelper.getProductList(req.body.userId)
  //getting total amount
  total = await userHelper.getTotalAmount(req.body.userId)
  //placing the order
  userHelper.placeOrder(req.body,products,total).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      //  creating an order id first for payment 
      // userHelper.generateRazorpay(total,orderId).then((response)=>{
      //   res.json(response)
      // })
    }
  })
})

//verifying the payment signature
router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
})

//getting order succes page
router.get('/order-success',verifyLogin,(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})

//viewing order page
router.get('/orders',verifyLogin,async(req,res)=>{
  orders= await userHelper.getUserOrder(req.session.user._id)
  res.render('user/view-orders',{user:req.session.user,orders})
})

//getting each orders product details quantity etc.
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  orderProducts = await userHelper.getOrderProductDetails(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,orderProducts})
})

module.exports = router;
  