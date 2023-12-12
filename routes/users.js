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
router.get('/',verifyLogin,function(req, res, next) {
  let user= req.session.user
  res.render('user/view-products',{user});
  
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
module.exports = router;
