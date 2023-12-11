var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

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
  productHelper.updateProduct(req.body,req.params.id).then(()=>{
    let imageFile = req.files.Image
    let id = req.params.id
    if(imageFile.mimetype=='image/jpg' || imageFile.mimetype=='image/jpeg'){
      imageFile.mv('./public/product-images/'+id+'.jpg')
    }else if(imageFile.mimetype=='image/png'){
      imageFile.mv('./public/product-images/'+id+'.png')
    }
    res.redirect('/admin')
  })
})
module.exports = router;