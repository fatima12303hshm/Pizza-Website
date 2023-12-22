let navbar = document.querySelector('.header .flex .navbar');

document.querySelector('#menu-btn').onclick = () =>{
   navbar.classList.toggle('active');
}

let account = document.querySelector('.user-account');

document.querySelector('#user-btn').onclick = () => {
   account.classList.add('active');
 
 }
 function toggleDropdown() {
   var dropdown = document.querySelector('.dropdown');
   dropdown.classList.toggle('active');
}


document.querySelector('#close-account').onclick = () =>{
   account.classList.remove('active');
}

let myOrders = document.querySelector('.my-orders');

document.querySelector('#order-btn').onclick = () =>{
   myOrders.classList.add('active');
}

document.querySelector('#close-orders').onclick = () =>{
   myOrders.classList.remove('active');
}

let cart = document.querySelector('.shopping-cart');

document.querySelector('#cart-btn').onclick = () =>{
   cart.classList.add('active');
}

document.querySelector('#close-cart').onclick = () =>{
   cart.classList.remove('active');
}

window.onscroll = () =>{
   navbar.classList.remove('active');
   myOrders.classList.remove('active');
   cart.classList.remove('active');
};

let slides = document.querySelectorAll('.home-bg .home .slide-container .slide');
let index = 0;

function next(){
   slides[index].classList.remove('active');
   index = (index + 1) % slides.length;
   slides[index].classList.add('active');
}

function prev(){
   slides[index].classList.remove('active');
   index = (index - 1 + slides.length) % slides.length;
   slides[index].classList.add('active');
}


function validateForm() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmNewPassword').value;
    var phone = document.getElementById('phoneNb').value;

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() !== '' && !emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return false;
    }

    if (password.trim() !== '') {
        var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            alert("Password must be at least 8 characters and include at least one lowercase, one uppercase, one number, and one special character");
            return false;
        }
    }

    if (confirmPassword.trim() !== '' && password !== confirmPassword) {
        alert("Passwords do not match");
        return false;
    }

    var phoneRegex = /^\d{8}$/;
    if (phone.trim() !== '' && !phoneRegex.test(phone)) {
        alert("Please enter a valid Albanian phone number (8 digits)");
        return false;
    }

    return true;
}
