var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
var userRouter = require('./users');


const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/')
  }
}
/* GET home page. */
const authAdmin=(req,res,next)=>{
  if(req.session.user.admin){
    next()
  }else{
    res.redirect('/')
  }
}


router.get('/',verifyLogin,authAdmin,function(req, res, next) {
  let user= req.session.user
  productHelper.getAllProducts().then((products)=>{
    res.render('admin/view-products', {admin:req.session.user.admin,user,products});
  })
});

//getting add-product page
router.get('/add-product',verifyLogin,authAdmin,(req,res)=>{
  let user= req.session.user
  res.render('admin/add-product',{admin:req.session.user.admin,user})
})

//adding a product
router.post('/add-product',verifyLogin,authAdmin,(req,res)=>{
  productHelper.addProduct(req.body,(id)=>{
    let imageFile=req.files.Image
    //moving image /public/product-images/ and renaming to id 
    if(req.files.Image.mimetype=='image/jpeg' || req.files.Image.mimetype=='image/jpeg' ){
      imageFile.mv('./public/product-images/'+id+'.jpg',(err)=>{
        if(err){
          console.log('Error while moving the image',err)
        }else{
          res.render('admin/add-product',{admin:req.session.user.admin})
        }
      })
    }else if(req.files.Image.mimetype=='image/png'){
      imageFile.mv('./public/product-images/'+id+'.png',(err)=>{
        if(err){
          console.log('Error while moving the image',err)
        }else{
          res.render('admin/add-product',{admin:req.session.user.admin})
        }
      })
    }
  })
})

//editing a product by admin
router.get('/edit-product/:id',verifyLogin,authAdmin,async(req,res)=>{  
  let user= req.session.user
  let product = await productHelper.getProductDetails(req.params.id)
  res.render('admin/edit-product',{admin:req.session.user.admin,product,user})
})
router.post('/edit-product/:id',verifyLogin,authAdmin,(req,res)=>{
  let id = req.params.id
  productHelper.updateProduct(req.body,req.params.id).then(()=>{
    //if image is changed then move the image
    if(req.files){
      let imageFile = req.files.Image
      if(imageFile.mimetype=='image/jpg' || imageFile.mimetype=='image/jpeg'){
        imageFile.mv('./public/product-images/'+id+'.jpg')
      }else if(imageFile.mimetype=='image/png'){
        imageFile.mv('./public/product-images/'+id+'.png')
      }
    }
    res.redirect('/admin')
  })
})

//admin deleting a product
router.get('/delete-product/:id',verifyLogin,authAdmin,(req,res)=>{
  productHelpers.deleteProduct(req.params.id).then(()=>{
    console.log('Product deleted')
    res.redirect('/admin')
  })
})


//view all users
router.get('/view-users',verifyLogin,authAdmin,async(req,res)=>{
  let user= req.session.user
  users = await productHelper.getAllUsers()
  res.render('admin/all-users',{admin:req.session.user.admin,users,user})

})

//viewing all  orders (for admin)
router.get('/all-orders',verifyLogin,authAdmin,async(req,res)=>{
  let user= req.session.user
  orders= await productHelper.getAllOrders()
  res.render('admin/all-orders',{admin:req.session.user.admin,orders,user })
})
module.exports = router;
