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
  
  products = await productHelper.getAllProducts()
  res.render('user/view-products',{user,products});
  
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
  cartProducts = await userHelper.getCart(req.session.user._id)
  console.log(cartProducts)
  if(cartProducts.length>0){
    total = await userHelper.getTotalAmount(req.session.user._id)
  }
  res.render('user/cart',{cartProducts,user:req.session.user})
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

  userHelper.changeItemQuantity(req.body).then((response)=>{
    res.json({status:true})
  })
})
module.exports = router;
