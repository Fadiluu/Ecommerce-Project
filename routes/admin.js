var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');

/* GET home page. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    res.render('admin/view-products', {admin:true,products});
  })
});

//getting add-product page
router.get('/add-product',(req,res)=>{
  res.render('admin/add-product',{admin:true})
})

//adding a product
router.post('/add-product',(req,res)=>{
  productHelper.addProduct(req.body,(id)=>{
    let imageFile=req.files.Image
    //moving image /public/product-images/ and renaming to id 
    if(req.files.Image.mimetype=='image/jpeg' || req.files.Image.mimetype=='image/jpeg' ){
      imageFile.mv('./public/product-images/'+id+'.jpg',(err)=>{
        if(err){
          console.log('Error while moving the image',err)
        }else{
          res.render('admin/add-product',{admin:true})
        }
      })
    }else if(req.files.Image.mimetype=='image/png'){
      imageFile.mv('./public/product-images/'+id+'.png',(err)=>{
        if(err){
          console.log('Error while moving the image',err)
        }else{
          res.render('admin/add-product',{admin:true})
        }
      })
    }
  })
})

//editing a product by admin
router.get('/edit-product/:id',async(req,res)=>{
  let product = await productHelper.getProductDetails(req.params.id)
  res.render('admin/edit-product',{admin:true,product})
})
router.post('/edit-product/:id',(req,res)=>{
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
router.get('/delete-product/:id',(req,res)=>{
  productHelpers.deleteProduct(req.params.id).then(()=>{
    console.log('Product deleted')
    res.redirect('/admin')
  })
})


//view all users
router.get('/view-users',async(req,res)=>{
  users = await productHelper.getAllUsers()
  res.render('admin/all-users',{admin:true,users})

})

//viewing all  orders (for admin)
router.get('/all-orders',async(req,res)=>{
  orders= await productHelper.getAllOrders()
  res.render('admin/all-orders',{admin:true,orders})
})
module.exports = router;
