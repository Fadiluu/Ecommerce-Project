function addToCart(proID){
    $.ajax({
        url:'/add-product-cart/'+proID,
        method:'get',
        success:(response)=>{
            
        }
    })
}
function changeProductQuantity(cartId,proId,count){
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    $.ajax({
        url:'/change-quantity',
        data:{
           cartId:cartId,
           proId:proId,
           count:count 
        },
        method:'post',
        success:(response)=>{
            count = parseInt(count)
            document.getElementById(proId).innerHTML=quantity+count
    
        }

    })

}