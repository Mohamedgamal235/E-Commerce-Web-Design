const CartItemStorage = 'cartItems';
const ProductsStorage = 'products';
const CurrentUserStorage = 'currentUser';
const SHIPPING_FLAT = 25.00;

function loadCart() {
    const raw = localStorage.getItem(CartItemStorage);
    return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
    localStorage.setItem(CartItemStorage, JSON.stringify(cart));
}

function loadProducts() {
    const raw = localStorage.getItem(ProductsStorage);
    return raw ? JSON.parse(raw) : [];
}

function saveProducts(products) {
    localStorage.setItem(ProductsStorage, JSON.stringify(products));
}

function formatPrice(n) {
    return `$ ${Number(n).toFixed(2)}`;
}

function calculateSubtotal(cart) {
    const sumCents = cart.reduce((sum, it) => {
        const unit = Math.round((Number(it.price || 0)) * 100);
        const qty = Number(it.quantity || 1);
        return sum + unit * qty;
    }, 0);
    return sumCents / 100;
}

function updateSummary(subtotal) {
    const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
    const total = subtotal + shipping;
    const subEl = document.getElementById('subtotal-text');
    const shipEl = document.getElementById('shipping-text');
    const totalEl = document.getElementById('total-text');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (subEl) subEl.textContent = formatPrice(subtotal);
    if (shipEl) shipEl.textContent = formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (checkoutBtn) checkoutBtn.disabled = (subtotal === 0);
}

function renderCart() {
    const cart = loadCart();
    const products = loadProducts();
    const cartList = document.getElementById('cart-list');
    const emptyPlaceholder = document.getElementById('empty-placeholder');
    if (!cartList) return;
    cartList.innerHTML = '';
    if (!cart || cart.length === 0) {
        if (emptyPlaceholder) emptyPlaceholder.classList.remove('d-none');
        updateSummary(0);
        return;
    } else {
        if (emptyPlaceholder) emptyPlaceholder.classList.add('d-none');
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'card card-cart p-3 shadow-sm bg-white';
    cart.forEach((item, idx) => {
        if (!item.quantity || item.quantity < 1) item.quantity = 1;
        const product = products.find(p => p.name === item.name && p.imageUrl === item.imageUrl);
        const stock = product ? (Number(product.stock) || 0) : (Number(item.stock) || 0);
        item.stock = stock;
        const unitPrice = Number(item.price || 0);
        const lineTotal = unitPrice * Number(item.quantity || 1);
        const row = document.createElement('div');
        row.className = 'd-flex align-items-start gap-3 py-3 border-bottom';
        row.innerHTML = `
                <img src="${encodeURI(item.imageUrl)}" alt="${item.name}" class="product-img" style="width:100px;height:100px;object-fit:cover" />
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="mb-1">${item.name}</h6>
                        <div class="text-muted mx-3">
                            <div class="line-total small text-dark fw-bold">${formatPrice(lineTotal)}</div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2 mt-3">
                        <button class="btn btn-outline-secondary qty-btn minus">
                        <i class="fa-solid fa-minus"></i>
                        </button>
                        <div class="d-flex flex-column align-items-center">
                            <input type="text" class="form-control text-center qty-input" 
                                value="${item.quantity}" readonly style="width:80px" />
                            <small class="stock-msg text-danger d-none" style="font-size:11px;"></small>
                        </div>
                        <button class="btn btn-outline-secondary qty-btn plus">
                        <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <div class="text-end mx-2"> 
                        <button class="btn btn-link text-danger  p-0 remove-link">
                            <i class="fa-regular fa-trash-can me-1"></i> Remove
                        </button>
                    </div>
                </div>
        `;
        wrapper.appendChild(row);
        const minus = row.querySelector('.minus');
        const plus = row.querySelector('.plus');
        const qtyInput = row.querySelector('.qty-input');
        const removeLink = row.querySelector('.remove-link');
        const stockMsg = row.querySelector('.stock-msg');
        const lineTotalEl = row.querySelector('.line-total');
        if (stock !== undefined && stock !== null) {
            stockMsg.textContent = `Stock: ${stock}`;
            stockMsg.classList.remove('d-none');
            stockMsg.classList.remove('text-danger');
            stockMsg.classList.add('text-muted');
        }
        const updateLineAndSummary = () => {
            const unit = Math.round(unitPrice * 100) / 100;
            const qty = Number(item.quantity || 1);
            const newLine = unit * qty;
            if (lineTotalEl) lineTotalEl.textContent = formatPrice(newLine);
            saveCart(cart);
            updateSummary(calculateSubtotal(cart));
        };
        minus.addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity--;
                qtyInput.value = item.quantity;
                qtyInput.classList.remove('border', 'border-danger');
                if (stockMsg) {
                    stockMsg.textContent = `Stock: ${stock}`;
                    stockMsg.classList.remove('text-danger');
                    stockMsg.classList.add('text-muted');
                }
                updateLineAndSummary();
            }
        });
        plus.addEventListener('click', () => {
            const maxStock = Number(item.stock || 0);
            if (maxStock > 0 && item.quantity >= maxStock) {
                qtyInput.classList.add('border', 'border-danger');
                stockMsg.textContent = `This is maximum stock (${maxStock})`;
                stockMsg.classList.remove('d-none');
                stockMsg.classList.remove('text-muted');
                stockMsg.classList.add('text-danger');
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: `Cannot add more than ${maxStock}`,
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }
            item.quantity++;
            qtyInput.value = item.quantity;
            qtyInput.classList.remove('border', 'border-danger');
            if (stockMsg) {
                stockMsg.textContent = `Stock: ${stock}`;
                stockMsg.classList.remove('text-danger');
                stockMsg.classList.add('text-muted');
            }
            updateLineAndSummary();
        });
        removeLink.addEventListener('click', () => {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    cart.splice(idx, 1);
                    saveCart(cart);
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: `"${item.name}" has been removed`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                    renderCart();
                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "info",
                        title: "Not removed",
                        showConfirmButton: false,
                        timer: 1000
                    });
                }
            });
        });
    });
    cartList.appendChild(wrapper);
    updateSummary(calculateSubtotal(cart));
    attachCheckoutHandler();
}

window.addEventListener('storage', (e) => {
    if (e.key === CartItemStorage || e.key === ProductsStorage) {
        renderCart();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function LogOut() {
    localStorage.removeItem("currentUser");
    try { sessionStorage.clear(); } catch(e) {}
    Swal.fire({
        position: "center",
        icon: "success",
        title: "You have been logged out",
        showConfirmButton: false,
        timer: 1200,
    }).then(() => {
        window.location.replace("login.html");
        setTimeout(() => {
        history.pushState(null, "", "login.html");
        window.addEventListener("popstate", function () {
            history.pushState(null, "", "login.html");
        });
        }, 0);
    });
}

function attachCheckoutHandler() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;
    if (checkoutBtn._attached) return;
    checkoutBtn._attached = true;
    checkoutBtn.addEventListener('click', () => {
        const cart = loadCart();
        if (!cart || cart.length === 0) {
            Swal.fire({ position: 'center', icon: 'info', title: 'Your cart is empty', showConfirmButton: false, timer: 1200 });
            return;
        }
        const products = loadProducts();
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            const prod = products.find(p => p.name === item.name && p.imageUrl === item.imageUrl);
            const available = prod ? Number(prod.stock || 0) : Number(item.stock || 0);
            const qty = Number(item.quantity || 1);
            if (available < qty) {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: `Not enough stock for "${item.name}". Available: ${available}`,
                    showConfirmButton: true
                });
                return;
            }
        }
        checkoutBtn.disabled = true;
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            const prodIndex = products.findIndex(p => p.name === item.name && p.imageUrl === item.imageUrl);
            if (prodIndex !== -1) {
                products[prodIndex].stock = Math.max(0, (Number(products[prodIndex].stock || 0) - Number(item.quantity || 1)));
            }
        }
        saveProducts(products);
        saveCart([]);
        renderCart();
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Order placed successfully',
            showConfirmButton: false,
            timer: 1600
        }).then(() => {
            checkoutBtn.disabled = true;
        });
    });
}
