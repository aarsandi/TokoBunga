const SERVER_PATH = 'http://localhost:3000'

let selectedProduct = null
let products = null

jQuery(document).ready(() => {
    showIndex()
    $('#loginForm').submit((e) => {
        e.preventDefault()
        const email = $('#usernameLogin').val()
        const password = $('#passwordLogin').val()

        if(!email||!password) {
            $('#alertLoginMessage').empty()
            $('#alertLoginMessage').append('Email dan Password harus diisi')
        } else {
            $.ajax({
                method: 'GET',
                url: `${SERVER_PATH}/user`,
            })
                .done((response) => {
                    if(response&&response.length){
                        const res = response.find((e) => e.email === email)
                        if(res&&res.password===password) {
                            localStorage.setItem('token', res.email)
                            localStorage.setItem('name', res.name)
                            showIndex()
                        } else {
                            $('#alertLoginMessage').empty()
                            $('#alertLoginMessage').append('email tidak ditemukan atau password salah')
                        }
                    } else {
                        $('#alertLoginMessage').empty()
                        $('#alertLoginMessage').append('email tidak ditemukan atau password salah')
                    }
                })
                .fail((xhr, status, error) => {
                    $('#alertLoginMessage').empty()
                    $('#alertLoginMessage').append('email tidak ditemukan atau password salah')
                })
        }
        
    })

    $('#registerForm').submit((e) => {
        e.preventDefault()
        const name = $('#nameRegister').val()
        const email = $('#usernameRegister').val()
        const password = $('#passwordRegister').val()
        if(email&&password&&isAggre){
            $('#registerMessage').empty()
            $('#alertRegisterTerm').empty()
            $.ajax({
                method: 'POST',
                url: `http://localhost:3000/user`,
                data: { name, email, password }
            })
                .done((response) => {
                    if(response){
                        showLogin()
                    }
                })
                .fail((xhr, status, error) => {
                    $('#registerMessage').empty()
                    $('#registerMessage').append('internal server error')
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
                    let dataKeranjang = response.find(e => e.productId==selectedProduct.id)
                    if(dataKeranjang) {
                        let newAmount = Number(amount)+Number(dataKeranjang.amount)
                        if(newAmount<=Number(selectedProduct.stok)) {
                            $.ajax({
                                method: 'PATCH',
                                url: `http://localhost:3000/keranjang/${dataKeranjang.id}`,
                                data: {
                                    amount: newAmount,
                                    total: Number(newAmount)*Number(selectedProduct.price)
                                }
                            })
                                .done((response) => {
                                    if(response){
                                        showKeranjangPage()
                                        $('#show-alert').show()
                                        $('#show-alert').empty()
                                        $('#show-alert').append(`
                                            <div class="alert alert-primary alert-dismissible show my-0" role="alert">
                                                ${selectedProduct.title} telah ditambahkan kekeranjang
                                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                        `)
                                    }
                                })
                        } else {
                            $('#show-alert').show()
                            $('#show-alert').empty()
                            $('#show-alert').append(`
                                <div class="alert alert-warning alert-dismissible show my-0" role="alert">
                                    Jumlah Terlalu Banyak
                                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            `)
                        }
                    } else {
                        if(amount<=Number(selectedProduct.stok)) {
                            $.ajax({
                                method: 'POST',
                                url: `http://localhost:3000/keranjang`,
                                data: {
                                    title: selectedProduct.title,
                                    price: selectedProduct.price,
                                    image: selectedProduct.image,
                                    amount: Number(amount),
                                    total: Number(amount)*Number(selectedProduct.price),
                                    userEmail: email,
                                    productId: selectedProduct.id
                                }
                            })
                                .done((response) => {
                                    if(response){
                                        showKeranjangPage()
                                        $('#show-alert').show()
                                        $('#show-alert').empty()
                                        $('#show-alert').append(`
                                            <div class="alert alert-primary alert-dismissible show my-0" role="alert">
                                                ${selectedProduct.title} telah ditambahkan kekeranjang
                                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                        `)
                                    }
                                })
                        } else {
                            $('#show-alert').show()
                            $('#show-alert').empty()
                            $('#show-alert').append(`
                                <div class="alert alert-warning alert-dismissible show my-0" role="alert">
                                    Jumlah Terlalu Banyak
                                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            `)
                        }
                    }
                }
            })
    })

    $('#logoutBtn').click((e) => {
        e.preventDefault()
        localStorage.removeItem('token')
        localStorage.removeItem('name')
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

    $('.HomeBtn').click((e) => {
        e.preventDefault()
        showBrowseProduct()
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

    $('#showLoginBtn').click((e) => {
        e.preventDefault()
        showLogin()
    })

    $('#showCheckoutPage').click((e) => {
        e.preventDefault()
        fetchHistoryOrder()
        showCheckoutPage()
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
                                    <a class="read-product-${product.id}"><img src="${product.image}" alt="img"></a>
                                </div>
                                <div class="product-info mt-15 text-center">
                                    <a class="read-product-${product.id}">
                                        <p>${product.title}</p>
                                    </a>
                                    <h6>Rp.${Number(product.price).toLocaleString('id-ID')}</h6>
                                </div>
                            </div>
                        </div>
                    `)
                    $(`.read-product-${product.id}`).click(function (event) {
                        event.preventDefault()
                        selectedProduct = product
                        showSingleProduct(product)
                    })
                })
                products = response
            } else {
                $('#show-alert').show()
                $('#show-alert').empty()
                $('#show-alert').append(`
                    <div class="alert alert-danger alert-dismissible show my-0" role="alert">
                        <strong>Error 404</strong> Produk Tidak Ditemukan
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                `)
            }
        })
        .fail( _ => {
            $('#show-alert').show()
            $('#show-alert').empty()
            $('#show-alert').append(`
                <div class="alert alert-danger alert-dismissible show my-0" role="alert">
                    <strong>Error 404</strong> Produk Tidak Ditemukan
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `)
        })
}

function fetchKeranjang() {
    $('#keranjangList').empty()
    $('#totalItem').empty()
    $('#totalPrice').empty()
    const email = localStorage.getItem('token')
    $.ajax({ method: 'GET', url: `${SERVER_PATH}/keranjang?userEmail=${email}`})
        .done((response) => {
            if (response && response.length) {
                let subTotal = 0
                let totalItem = 0
                response.forEach(product => {
                    subTotal = subTotal + Number(product.total)
                    totalItem = totalItem + Number(product.amount)
                    $('#keranjangList').append(`
                        <tr>
                            <td class="cart_product_img">
                                <a><img src="${product.image}" alt="Product"></a>
                                <h5>${product.title}</h5>
                            </td>
                            <td class="qty"><span>${product.amount}</span></td>
                            <td class="price"><span>Rp${Number(product.price).toLocaleString('id-ID')}</span></td>
                            <td class="total_price"><span>Rp${Number(product.price*product.amount).toLocaleString('id-ID')}</span></td>
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
                $('#buyBtn').show()
                $('#totalItem').append(`${totalItem}`)
                $('#totalPrice').append(`Rp${subTotal.toLocaleString('id-ID')}.00`)
                $(`#buyBtn`).click(async(event) => {
                    event.preventDefault()
                    if(products&&products.length&&localStorage.getItem('token')){
                        response.forEach( async (product) => {
                            let productTemp = products.find(e => e.id == product.productId)
                            if(productTemp){
                                let remaining = Number(productTemp.stok) - Number(product.amount)
                                await $.ajax({
                                    method: 'PATCH',
                                    url: `${SERVER_PATH}/product/${productTemp.id}`,
                                    data: {
                                        stok: remaining
                                    }
                                }).done(_ => {
                                    console.log('berhasil edit stok')
                                })
                                await $.ajax({
                                    method: 'DELETE',
                                    url: `${SERVER_PATH}/keranjang/${product.id}`
                                }).done(_ => {
                                    console.log('berhasil delete keranjang')
                                })
                            }else{
                                showBrowseProduct()
                            }
                        })
                        const dateNow = new Date()
                        await $.ajax({
                            method: 'POST',
                            url: `http://localhost:3000/historyOrder`,
                            data: {
                                idNota: `INV${Math.random().toString(36).substr(2, 9)}${Date.parse(dateNow)}`,
                                status: "sedang diproses",
                                totalBarang: totalItem,
                                totalHarga: subTotal,
                                tanggal: dateNow,
                                userEmail: localStorage.getItem('token')
                            }
                        }).done(_ => {
                            console.log('berhasil Membuat invoice')
                        })
                        showBrowseProduct()
                        $('#show-alert').show()
                        $('#show-alert').empty()
                        $('#show-alert').append(`
                            <div class="alert alert-primary alert-dismissible show my-0" role="alert">
                                Pesananmu Sedang diproses, Silahkan tunggu konfirmasi selanjutnya
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        `)
                    }else{
                        showBrowseProduct()
                        $('#show-alert').show()
                        $('#show-alert').empty()
                        $('#show-alert').append(`
                            <div class="alert alert-danger alert-dismissible show my-0" role="alert">
                                <strong>Error 404</strong> Data Tidak Ditemukan Harap Refresh
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        `)
                    }
                })
            }else{
                $('#keranjangList').append(`<tr><td colspan="5">Keranjangmu Masih Kosong</td></tr>`)
                $('#totalItem').append(`0`)
                $('#totalPrice').append(`Rp0.00`)
            }
        })
        .fail( _ => {
            $('#keranjangList').append(`<tr><td colspan="5">Keranjangmu Masih Kosong</td></tr>`)
            $('#totalItem').append(`0`)
            $('#totalPrice').append(`Rp0.00`)
        })
}

function fetchHistoryOrder() {
    $('#historyList').empty()
    const email = localStorage.getItem('token')
    email?$.ajax({ method: 'GET', url: `${SERVER_PATH}/historyOrder?userEmail=${email}`})
        .done((response) => {
            if (response && response.length) {
                response.forEach((el, index) => {
                    $('#historyList').append(`
                    <tr>
                        <td>${index}</td>
                        <td>${el.idNota}</td>
                        <td>${el.status}</td>
                        <td>${el.totalBarang}</td>
                        <td>${el.totalHarga}</td>
                        <td>${new Date(el.tanggal).toLocaleString('id-ID')}</td>
                    </tr>
                    `)
                })
            }else{
                $('#historyList').append(`
                    <tr>
                        <td colspan="6">Kamu Belum Memiliki History Order</td>
                    </tr>
                `)
            }
        })
        .fail( _ => {
            $('#historyList').append(`
                <tr>
                    <td colspan="6">Kamu Belum Memiliki History Order</td>
                </tr>
            `)
        }) :
    showBrowseProduct()
}

function checkLogin() {
    if(!localStorage.getItem('token')) {
        $('#navUser').hide()
        $('#navLoginBtn').show()
    } else {
        $('#userLoginEmail').empty()
        $('#navUser').show()
        $('#navLoginBtn').hide()
        $('#userLoginEmail').append(`Selamat Datang. ${localStorage.getItem('name')} <b class="caret"></b>`)
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
        $('#productTags').empty()
        $('#productCategory').empty()
        $('.quantity').empty()

        $('.quantity').append(`<input id="formAddToCartStok" type="number" class="qty-text" id="qty" step="1" min="1" max="${product.stok}" name="stok" value="1">`)
        $('#productTitleBC').append(product.title)
        $('#productTitle').append(product.title)
        $('#productPrice').append(`Rp${Number(product.price).toLocaleString('id-ID')}`)
        $('#productDesc').append(product.description)
        $('#productImage').append(`
            <a class="product-img" href="${product.image}" title="Product Image">
                <img class="d-block w-100" src="${product.image}" alt="1">
            </a>
        `)
        $('#productStok').append(product.stok)
        $('#productTags').append(product.tags)
        $('#productCategory').append(product.category)
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

function showKeranjangPage() {
    $('#shopPage').hide()
    $('#aboutPage').hide()
    $('#contactPage').hide()
    $('#singleProductPage').hide()
    $('#keranjangPage').show()
    $('#checkoutPage').hide()
    fetchKeranjang()
}
