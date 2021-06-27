const SERVER_PATH = 'http://localhost:3000'

let selectedProduct = null
let products = null

jQuery(document).ready(() => {
    showIndex()
    $('#loginForm').submit((e) => {
        e.preventDefault()
        const email = $('#usernameLogin').val()
        const password = $('#passwordLogin').val()
        
        $.ajax({
            method: 'GET',
            url: `${SERVER_PATH}/user`,
        })
            .done((response) => {
                if(response&&response.length){
                    const res = response.find((e) => e.email === email)
                    if(res&&res.password===password) {
                        localStorage.setItem('token', res.email)
                        showIndex()
                    }else {
                        $('#loginMessage').empty()
                        $('#loginMessage').append('email tidak ditemukan atau password salah')
                    }
                } else {
                    $('#loginMessage').empty()
                    $('#loginMessage').append('email tidak ditemukan atau password salah')
                }
            })
    })

    $('#registerForm').submit((e) => {
        e.preventDefault()
        const email = $('#usernameRegister').val()
        const password = $('#passwordRegister').val()
        if(email&&password){
            $.ajax({
                method: 'POST',
                url: `http://localhost:3000/user`,
                data: {
                    email: email,
                    password: password
                }
            })
                .done((response) => {
                    if(response){
                        showLogin()
                    }
                })
        } else {
            if(!email){
                $('#registerMessage').empty()
                $('#registerMessage').append('email harus diisi')
            }
            if(!password){
                $('#registerMessage').empty()
                $('#registerMessage').append('password harus diisi')
            }
        }
    })

    $('#formAddToCart').submit((e) => {
        e.preventDefault()
        let amount = $('#formAddToCartStok').val()
        const email = localStorage.getItem('token')
        $.ajax({
            method: 'GET',
            url: `${SERVER_PATH}/keranjang?userEmail=${email}`
        })
            .done((response) => {
                if (response) {
                    let dataKeranjang = response.find(e => e.idProduct==selectedProduct.id)
                    if(dataKeranjang) {
                        let newAmount = Number(amount)+dataKeranjang.amount
                        if(newAmount<=selectedProduct.stok) {
                            $.ajax({
                                method: 'PATCH',
                                url: `http://localhost:3000/keranjang/${dataKeranjang.id}`,
                                data: {
                                    amount: newAmount,
                                    total: newAmount*selectedProduct.price
                                }
                            })
                                .done((response) => {
                                    if(response){
                                        console.log('sukses add to cart')
                                    }
                                })
                        } else {
                            console.log('amount terlalu banyak')
                        }
                    } else {
                        if(amount<=selectedProduct.stok) {
                            $.ajax({
                                method: 'POST',
                                url: `http://localhost:3000/keranjang`,
                                data: {
                                    title: selectedProduct.title,
                                    price: selectedProduct.price,
                                    image: selectedProduct.image,
                                    amount: Number(amount),
                                    total: Number(amount)*selectedProduct.price,
                                    userEmail: email,
                                    productId: selectedProduct.id
                                }
                            })
                                .done((response) => {
                                    if(response){
                                        console.log('sukses add to cart')
                                    }
                                })
                        } else {
                            console.log('amount terlalu banyak')
                        }
                    }
                }
            })
    })

    $('#logoutBtn').click((e) => {
        e.preventDefault()
        localStorage.removeItem('token')
        showLogin()
    })

    $('#showShopPageBtn').click((e) => {
        e.preventDefault()
        showBrowseProduct()
    })

    $('#showAboutPageBtn').click((e) => {
        e.preventDefault()
        showAboutPage()
    })

    $('#showContactPageBtn').click((e) => {
        e.preventDefault()
        showContactPage()
    })

    $('#showKeranjangBtn').click((e) => {
        e.preventDefault()
        showKeranjangPage()
    })

    $('#showSinglePageBtn').click((e) => {
        e.preventDefault()
        showSingleProduct()
    })

    $('#navLoginBtn').click((e) => {
        e.preventDefault()
        showLogin()
    })

    $('#showRegisterPage').click((e) => {
        e.preventDefault()
        showRegister()
    })
})

function fetchProduct() {
    $('#productList').empty()
    $.ajax({
        method: 'GET',
        url: `${SERVER_PATH}/product`
    })
        .done((response) => {
            if (response && response.length) {
                response.forEach(product => {
                    $('#productList').append(`
                        <div class="col-12 col-sm-6 col-lg-3">
                            <div class="single-product-area mb-50">
                                <div class="product-img">
                                    <a><img src="${product.image}" alt="img"></a>
                                </div>
                                <div class="product-info mt-15 text-center">
                                    <a id="read-product-${product.id}">
                                        <p>${product.title}</p>
                                    </a>
                                    <h6>Rp.${product.price}</h6>
                                </div>
                            </div>
                        </div>
                    `)
                    $(`#read-product-${product.id}`).click(function (event) {
                        event.preventDefault()
                        selectedProduct = product
                        showSingleProduct(product)
                    })
                })
                products = response
            } else {
                $('#show-alert').empty()
                $('#show-alert').append(`
                    <div class="alert alert-danger" role="alert">
                        <strong>Data Tidak Ditemukan</strong>
                    </div>
                `)
            }
        })
        .fail((xhr, status, error) => {
            $('#show-alert').empty()
            $('#show-alert').append(`
                <div class="alert alert-danger" role="alert">
                    <strong>Data Tidak Ditemukan</strong>
                </div>
            `)
        })
}

function fetchKeranjang() {
    $('#keranjangList').empty()
    $('#subTotalKeranjang').empty()
    $('#totalKeranjang').empty()
    const email = localStorage.getItem('token')
    $.ajax({
        method: 'GET',
        url: `${SERVER_PATH}/keranjang?userEmail=${email}`
    })
        .done((response) => {
            if (response && response.length) {
                let subTotal = 0
                response.forEach(product => {
                    subTotal = subTotal + Number(product.total)
                    $('#keranjangList').append(`
                        <tr>
                            <td class="cart_product_img">
                                <a><img src="${product.image}" alt="Product"></a>
                                <h5>${product.title}</h5>
                            </td>
                            <td class="qty"><span>${product.amount}</span></td>
                            <td class="price"><span>Rp.${product.price}</span></td>
                            <td class="total_price"><span>Rp.${product.price*product.amount}</span></td>
                            <td class="action"><a id="remove-cart-${product.id}"><i class="fa fa-close"></i></a></td>
                        </tr>
                    `)
                    $(`#remove-cart-${product.id}`).click(function (event) {
                        event.preventDefault()
                        $.ajax({
                            method: 'DELETE',
                            url: `http://localhost:3000/keranjang/${product.id}`
                        })
                            .done((response) => {
                                if(response){
                                    showKeranjangPage()
                                }
                            })
                    })
                })
                $('#subTotalKeranjang').empty()
                $('#subTotalKeranjang').append(`
                    <h5 class="title--">Cart Total</h5>
                    <div class="subtotal d-flex justify-content-between">
                        <h5>Subtotal</h5>
                        <h5>${subTotal}</h5>
                    </div>
                    <div class="total d-flex justify-content-between">
                        <h5>Total</h5>
                        <h5>${subTotal}</h5>
                    </div>
                    <div class="checkout-btn">
                        <a id="buyBtn" class="btn alazea-btn w-100">Beli</a>
                    </div>
                `)
                $(`#buyBtn`).click((event) => {
                    event.preventDefault()
                    response.forEach(product => {
                        let productTemp = products.find(e => e.id === Number(product.productId))
                        let remaining = productTemp.stok - Number(product.amount)
                        $.ajax({
                            method: 'PATCH',
                            url: `${SERVER_PATH}/product/${product.id}`,
                            data: {
                                stok: Number(remaining)
                            }
                        }).done((response) => {
                            console.log(response)
                        })
                        $.ajax({
                            method: 'DELETE',
                            url: `${SERVER_PATH}/keranjang/${product.id}`
                        }).done((response) => {
                            console.log(response)
                        })
                    })
                })
            }
        })
}

function checkLogin() {
    if(!localStorage.getItem('token')) {
        $('#navUser').hide()
        $('#navLoginBtn').show()
    } else {
        $('#userLoginEmail').empty()
        $('#navUser').show()
        $('#navLoginBtn').hide()
        $('#userLoginEmail').append(`Selamat Datang. ${localStorage.getItem('token')} <b class="caret"></b>`)
    }
}

function showIndex() {
    $('#loginPage').hide()
    $('#indexPage').show()
    $('#registerPage').hide()
    checkLogin()
    fetchProduct()
}

function showLogin() {
    $('#indexPage').hide()
    $('#loginPage').show()
    $('#registerPage').hide()
}

function showRegister() {
    $('#indexPage').hide()
    $('#loginPage').hide()
    $('#registerPage').show()
}

function showBrowseProduct() {
    $('#shopPage').show()
    $('#aboutPage').hide()
    $('#contactPage').hide()
    $('#singleProductPage').hide()
    $('#keranjangPage').hide()
    $('#checkoutPage').hide()
}

function showSingleProduct(product) {
    $('#shopPage').hide()
    $('#aboutPage').hide()
    $('#contactPage').hide()
    $('#singleProductPage').show()
    $('#keranjangPage').hide()
    $('#checkoutPage').hide()
    if (product) {
        $('#productTitleBC').empty()
        $('#productTitle').empty()
        $('#productPrice').empty()
        $('#productDesc').empty()
        $('#productImage').empty()
        $('#productStok').empty()

        $('#productTitleBC').append(product.title)
        $('#productTitle').append(product.title)
        $('#productPrice').append(`Rp.${product.price}`)
        $('#productDesc').append(product.description)
        $('#productImage').append(`
            <a class="product-img" href="${product.image}" title="Product Image">
                <img class="d-block w-100" src="${product.image}" alt="1">
            </a>
        `)
        $('#productStok').append(product.stok)
    }
}


function showCheckoutPage() {
    $('#shopPage').hide()
    $('#aboutPage').hide()
    $('#contactPage').hide()
    $('#singleProductPage').hide()
    $('#keranjangPage').hide()
    $('#checkoutPage').show()
}

function showAboutPage() {
    $('#shopPage').hide()
    $('#aboutPage').show()
    $('#contactPage').hide()
    $('#singleProductPage').hide()
    $('#keranjangPage').hide()
    $('#checkoutPage').hide()
}

function showContactPage() {
    $('#shopPage').hide()
    $('#aboutPage').hide()
    $('#contactPage').show()
    $('#singleProductPage').hide()
    $('#keranjangPage').hide()
    $('#checkoutPage').hide()
}

function showKeranjangPage() {
    $('#shopPage').hide()
    $('#aboutPage').hide()
    $('#contactPage').hide()
    $('#singleProductPage').hide()
    $('#keranjangPage').show()
    $('#checkoutPage').hide()
    fetchKeranjang()
}
