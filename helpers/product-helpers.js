var db=require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
const Promise=require('promise')
const { resolve, reject } = require('promise')
var objectID = require('mongodb').ObjectId
module.exports={
    //adding products --by admin
    addProduct:(product,callback)=>{
        product.Price=parseInt(product.Price)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((id)=>{
            callback(id.insertedId.toString())
        })
    },

    //getting products details for 
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    //getting product deatils with product id for delete or edit product
    getProductDetails:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let productDetails=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new objectID(proId)})
            resolve(productDetails)
        })
    },

    //editting product from admin panel
    updateProduct:(product,proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectID(proId)},{
                $set:{
                    Name:product.Name,
                    Category:product.Category,
                    Price:product.Price,
                    Description:product.Description
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    //deleting product (admin)
    deleteProduct:(proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new objectID(proId)}).then(()=>{
                resolve()
            })
        })
    },

    //getting all users details 
    getAllUsers:()=>{
        return new Promise((resolve, reject) => {
            let users = db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    }

}
