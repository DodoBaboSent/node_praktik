
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
}
export function updateUser(){
    console.log("hit")
    if (cookie !== undefined) {
        document.getElementById("logName").innerHTML = "<h1>Вы: "+decodeURIComponent(cookie)+"</h1>"
    } else {
        document.getElementById("logName").innerHTML = null;
    }
}
/**
 *
 * @type {string[]}
 */
let cart = window.sessionStorage.getItem("cart")?.split(",") || []
/**
 *
 * @param id integer
 */
export function addToCart(id){
    let id_str = id.toString()
    if (!cart.includes(id_str)) { cart.push(id.toString()) }
    window.sessionStorage.setItem("cart", cart)
}
export function clearCart(){
    cart = []
    window.sessionStorage.removeItem("cart")
}

export function send(){
    const request = []
    for (const Element of cart) {
        request.push({id: +Element})
    }
    console.log(request)
    htmx.ajax('POST', '/cart', { values: cart })
}