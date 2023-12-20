const { response } = require("express")

function addToCart(proID){
    $.ajax({
        url:'/add-product-cart/'+proID,
        method:'get',
        success:(response)=>{
            let count=$('#cart-count').html()
            if(count==null || count==""||count==undefined){
                count=1
            }else{
                count=parseInt(count)+1
            }
            $('#cart-count').html(count)

        }
    })
}



function changeProductQuantity(cartId,proId,userId,count){
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    $.ajax({
        url:'/change-quantity',
        data:{
            cartId:cartId,
            proId:proId,
            userId:userId,
            count:count, 
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            count = parseInt(count)
            if(response.removeProduct){
                alert("Product Removed Successfully")
                location.reload()
            }else{
                document.getElementById(proId).innerHTML=quantity+count
                document.getElementById('total').innerHTML=response.total
            }
        }

    })

}
