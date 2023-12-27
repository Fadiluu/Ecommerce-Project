var db=require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt');
const { reject, resolve } = require('promise');
const { response } = require('../app');
const { ObjectId, ConnectionCheckOutFailedEvent } = require('mongodb');
var objectID = require('mongodb').ObjectId
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_IQIviI9EGGWfpX',
    key_secret: '61cHiLdYJNqRncsW0GP7RvC5',
  });
module.exports={
    checkUserExists:(userEmail)=>{
        return new Promise(async(resolve, reject) => {
            let userExists = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userEmail})
            resolve(userExists)
        })
    },

    doSignup:(userDetails)=>{
        return new Promise(async(resolve, reject) => {
            userDetails.Password=await  bcrypt.hash(userDetails.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userDetails).then(()=>{
                resolve()
            })

        })
    },

    doLogin:(userDetails)=>{
        return new Promise(async(resolve, reject) => {
            email=userDetails.Email
            passwordHash= bcrypt.hash(userDetails.Password,10)
            let response={}
            user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:email})
            if(user){
                bcrypt.compare(userDetails.Password,user.Password).then((status)=>{
                    if(status){
                        response.user = user
                        response.status= true
                        resolve(response)
                    }
                    else{
                        errorMessage='Invalid Password'
                        resolve({status:false,errorMessage})
                        //sending ann error mesage if the password is incorrect
                    }
                });
            }else{
                errorMessage='Account with this email doesn\'t exists'
                resolve({status:false,errorMessage})
                // sending error message if the email id is not registered
            }
            
        })
    },

    getCart:(userId)=>{
        return new Promise(async(resolve, reject) => {
            // getting details of cart items
            cartProducts = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user: new ObjectId(userId) }
                },
                {
                    $unwind:"$products"
                },
                {
                    $project:{
                        item:"$products.item",
                        quantity:"$products.quantity"
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "item",
                        foreignField: "_id",
                        as: "productInfo"
                    }
                },
                {
                    $project:{quantity:1,product:{$arrayElemAt:['$productInfo',0]}}
                    // $arrayElemAt returns the object inside an array at a specified index otherwise it will appear productInfo[ [object] ]
                }
            ]).toArray();
            resolve(cartProducts)
        })
    },

    //getting total cart amount
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve, reject) => {
            total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user: new ObjectId(userId) }
                },
                {
                    $unwind:"$products"
                },
                {
                    $project:{
                        item:"$products.item",
                        quantity:"$products.quantity"
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "item",
                        foreignField: "_id",
                        as: "productInfo"
                    }
                },
                {
                    $project:{quantity:1,product:{$arrayElemAt:['$productInfo',0]}}
                    // $arrayElemAt returns the object inside an array at a specified index otherwise it will appear productInfo[ [object] ]
                },
                {
                    $group:{
                        _id:null,
                        "total":{$sum:{$multiply:["$product.Price","$quantity"]}}
                    }
                }
            ]).toArray();
            if(total[0]){

                resolve(total[0].total)
            }else{
                resolve()
            }
        })
    },

    addToCart:(userId,proId)=>{
        return new Promise(async(resolve, reject) => {
            proObj = {
                item:new objectID(proId),
                quantity:1

            }
            //checking if the user has an existing cart
            cartExist = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectID(userId)})
            //if cart exits then add item to this cart otherwise create a cart for the user and insert the product value
            if(cartExist){
                //checking if the existing cart has this particular product by findindex method javascript
                proExist = cartExist.products.findIndex(product => product.item==proId)
                //if the item exists in the cart then increment the quantity by 1 other wise push or add the item into the cart products array
                if(proExist != -1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:new ObjectId(userId),"products.item":new ObjectId(proId)},
                    {
                        $inc:{"products.$.quantity":1}
                    }).then(()=>{
                        console.log("quantity increased by 1")
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:new objectID(userId)},{
                        $push:{"products":proObj}
                    }).then((response)=>{
                        console.log('item added to product')
                        resolve()
                    })
                }
            }else{
                cartObj={
                    user:new objectID(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },

    //removing product from the cart
    removeCartItem:(cartId,proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({_id: new ObjectId(cartId)},{
                $pull:{"products":{"item":new ObjectId(proId)}}
            }).then((response)=>{
                resolve()
            })
        })
    },
    
    //changing item quantity:
    changeItemQuantity:(details)=>{
        return new Promise((resolve, reject) => {
            count=parseInt(details.count)
            if(details.quantity==1 & count==-1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:new ObjectId(details.cartId)},
                {
                    $pull:{"products":{"item":new objectID(details.proId)}}
                })
                resolve({removeProduct:true})
            }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:new ObjectId(details.cartId),"products.item":new ObjectId(details.proId)},
                {
                    $inc:{"products.$.quantity":count}
                }).then((response)=>{
                    resolve({status:true})
                })
            }
        })
    },

    //getting cart count to display on the header
    getCartCount:(userId)=>{
        return new Promise(async(resolve, reject) => {
            cartCount = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:new ObjectId(userId)}
                },
                {
                    $unwind:"$products"
                },
                {
                    $group:{
                        _id:null,
                        "totalQuantity":{
                            $sum:"$products.quantity"
                        }
                    }
                }
            ]).toArray()
            if(cartCount[0]){
                resolve(cartCount[0].totalQuantity)
            }else{
                resolve()
            }

        })
    },
    
    getProductList:(userId)=>{
        return new Promise(async(resolve, reject) => {
            cart= await db.get().collection(collection.CART_COLLECTION).findOne({user: new objectID(userId)})
            resolve(cart.products)
        })
    },

    //placing order 
    placeOrder:(order,products,total)=>{
        return new Promise((resolve, reject) => {
            let status=order['payment-method']=='COD'?'placed':'pending'
            var date = Date()
            date = new Date(date).toUTCString();
            date = date.split(' ').slice(0,6).join(' ')
            let orderObj={
                delivery:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:new ObjectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                price:total,
                status:status,
                orderDate: date
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:new ObjectId(order.userId)})
                resolve(response.insertedId.toString())
            })
        })
    },


    //getting users order details
    getUserOrder:(userId)=>{
        return new Promise(async(resolve, reject) => {
            orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:new ObjectId(userId)}).toArray()
            resolve(orders)
        })
    },

    //getting each orders product details quantity etc.
    getOrderProductDetails:(orderId)=>{
        return new Promise(async(resolve, reject) => {
            orderProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:new ObjectId(orderId)}
                },
                {
                    $unwind:"$products"
                },
                {
                    $project:{
                        item:"$products.item",
                        quantity:"$products.quantity"
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "item",
                        foreignField: "_id",
                        as: "productInfo"
                    }
                },
                {
                    $project:{quantity:1,product:{$arrayElemAt:['$productInfo',0]}}
                    // $arrayElemAt returns the object inside an array at a specified index otherwise it will appear productInfo[ [object] ]
                }
            ]).toArray()
            resolve(orderProducts)
        })
    },
    // creating an order id
    generateRazorpay:(total,orderId)=>{
        return new Promise((resolve, reject) => {
            var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err)
                }else{
                    resolve(order)
                }
              });
        })
    },
    
    //verify payment using payment signature
    verifyPaymentSignature:(details)=>{
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', '61cHiLdYJNqRncsW0GP7RvC5');
            hmac.update(details['payment[razorpay_order_id]']+ "|" + details['payment[razorpay_payment_id]'] , '61cHiLdYJNqRncsW0GP7RvC5');
            hmac=hmac.digest('hex')
            if(hmac===details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },

    // changing order status from pending to placed when online payment is successfull  
    changeOrderStatus:(orderId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new ObjectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }).then(()=>{
                resolve()
            })
        })
    }

}

