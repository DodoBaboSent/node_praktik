'use strict'

console.log('PRIVET MIR!!!')

const cookies = document.cookie.split(";")
const cookie = cookies.find((row) => row.startsWith("user="))?.split("=")[1]

console.log(cookie)

if (cookie !== undefined) {
    document.getElementById("logName").innerHTML = "<h1>Вы: "+decodeURIComponent(cookie)+"</h1>"
} else {
    document.getElementById("logName").innerHTML = null;
}