var db=require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt');
const { reject, resolve } = require('promise');
const { response } = require('../app');
var objectID = require('mongodb').ObjectId
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
            console.log(userDetails.Password)
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
    }
}

