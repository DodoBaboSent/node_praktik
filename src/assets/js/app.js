
console.log('PRIVET MIR!!!')

const htmx = require("./htmx.min.js")

const cookies = document.cookie.split(";")
const cookie = cookies.find((row) => row.startsWith("user="))?.split("=")[1]

console.log(cookie)
if (document.readyState === "complete") updateUser();
else {
    window.addEventListener("load", updateUser)
    window.addToCart = addToCart
    window.clearCart = clearCart
    window.send = send
    window.updateCart = updateCart
}
export function updateUser(){
    console.log("hit")
    if (cookie !== undefined) {
        document.getElementById("logName").innerHTML = "<h1>Вы: "+decodeURIComponent(cookie)+"</h1>"
    } else {
        document.getElementById("logName").innerHTML = null;
    }
}

export function contains(needle, cart){
    return cart.some(elem => {
        return JSON.stringify(needle) === JSON.stringify(elem);
    })
}

/**
 *
 * @param id integer
 */
export function addToCart(id){
    let name = document.getElementById(`name__${id}`).innerText
    let price = document.getElementById(`price__${id}`).innerText
    let quantity = document.getElementById(`quant__${id}`).innerText
    let obj = {id: id, name: name, price: price, quantity: quantity}
    let cart
    if(sessionStorage.cart)
    {
        cart= JSON.parse(sessionStorage.getItem('cart'));
    }else{
        cart=[];
    }
    if (!contains(obj, cart)) {
        console.log(!cart.includes(obj))
        cart.push(obj)
        sessionStorage.setItem("cart", JSON.stringify(cart))
    }
    updateCart()
}



export function updateCart(){
    let cart_el = document.getElementById("cart__view")
    let cart = window.sessionStorage.getItem("cart")
    let cart_view = JSON.parse(cart)

    //console.log(cart_view)
    let HTMLstring = ''
    for (let cartViewKey in cart_view) {
        console.log(cart_view[cartViewKey])
        HTMLstring += `<div><div class="inline-block">${cart_view[cartViewKey].name}</div> | <div class="inline-block">${cart_view[cartViewKey].price}</div> | <div class="inline-block">${cart_view[cartViewKey].quantity}</div></div>`
    }
    cart_el.innerHTML = HTMLstring
}

export function clearCart(){
    window.sessionStorage.removeItem("cart")
    updateCart()
}

export function send(){
    let cart = sessionStorage.getItem("cart")
    htmx.ajax('POST', '/cart', { values: JSON.parse(cart) })
}