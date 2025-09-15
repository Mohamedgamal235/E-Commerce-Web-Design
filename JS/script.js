const CartItemStorage = 'cartItems';
const ProductsStorage = 'products';
const SHIPPING_FLAT = 25.00; 

let DefaultProducts = [
    { imageUrl: "Images/The-Classic-Trench.png", name: "The Classic Trench", price: 350.00, stock: 5, description: "" },
    { imageUrl: "Images/Silk Scarf.png", name: "Silk Scarf", price: 120.00, stock: 12, description: "" },
    { imageUrl: "Images/bag.png", name: "Leather Tote Bag", price: 480.00, stock: 3, description: "" },
    { imageUrl: "Images/sweetshert.png", name: "Cashmere Sweater", price: 290.00, stock: 7, description: "" },
    { imageUrl: "Images/dress.png", name: "Evening Dress", price: 650.00, stock: 2, description: "" },
    { imageUrl: "Images/watch.png", name: "Luxury Watch", price: 900.00, stock: 4, description: "" },
    { imageUrl: "Images/shose1.png", name: "Leather Shoes", price: 220.00, stock: 10, description: "" },
    { imageUrl: "Images/hat.png", name: "Classic Hat", price: 80.00, stock: 15, description: "" },
    { imageUrl: "Images/perfum.png", name: "Luxury Perfume", price: 150.00, stock: 9, description: "" }
];

function loadProducts() {
    const raw = localStorage.getItem(ProductsStorage);
    if (!raw) {
        localStorage.setItem(ProductsStorage, JSON.stringify(DefaultProducts));
        return DefaultProducts.slice();
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error('Invalid products stored, resetting to defaults', e);
        localStorage.setItem(ProductsStorage, JSON.stringify(DefaultProducts));
        return DefaultProducts.slice();
    }
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ============================================================
// ============================================================
// ============================================================


// --- Add Product ---
function AddProduct() {
    const nameEl = document.getElementById('ProductName');
    const priceEl = document.getElementById('Price');
    const stockEl = document.getElementById('Stock');
    const imageEl = document.getElementById('ImageUrl');
    const descEl = document.getElementById('Description');

    const name = (nameEl?.value || '').trim();
    const price = parseFloat(priceEl?.value || '0');
    const stock = parseInt(stockEl?.value || '0', 10);
    const imageUrl = (imageEl?.value || '').trim();
    const description = (descEl?.value || '').trim();

    if (!name) {
        Swal.fire({ icon: 'error', title: 'Product name is required' });
        return;
    }
    if (!imageUrl) {
        Swal.fire({ icon: 'error', title: 'Image URL is required' });
        return;
    }
    if (isNaN(price) || price <= 0) {
        Swal.fire({ icon: 'error', title: 'Enter a valid price' });
        return;
    }
    if (isNaN(stock) || stock < 0) {
        Swal.fire({ icon: 'error', title: 'Enter a valid stock (0 or more)' });
        return;
    }

    const products = loadProducts();
    const exists = products.find(p => p.name === name && p.imageUrl === imageUrl);
    if (exists) {
        Swal.fire({ icon: 'warning', title: 'Product already exists' });
        return;
    }

    const newProduct = {
        name,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
        description
    };

    products.push(newProduct);
    saveProducts(products);

    Swal.fire({
        position: 'center',
        icon: 'success',
        title: `"${name}" added to products`,
        showConfirmButton: false,
        timer: 1500
    });

    nameEl.value = '';
    priceEl.value = '';
    stockEl.value = '';
    imageEl.value = '';
    descEl.value = '';

    window.dispatchEvent(new Event('storage')); 
}

function renderProductCards() {
    const section = document.querySelector(".ProdcutCards");
    if (!section) 
        return;
    section.innerHTML = ''; 

    const container = document.createElement("div");
    container.className = "container py-5";
    const row = document.createElement("div");
    row.className = "row g-4";
    container.appendChild(row);
    section.appendChild(container);

    const products = loadProducts();
    const cart = loadCart();

    products.forEach((p) => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-12 col-md-4 col-lg-3";

        const card = document.createElement("div");
        card.className = "card h-100 shadow";

        const srcImage = encodeURI(p.imageUrl || 'Images/placeholder.png');

        card.innerHTML = `
            <div style="overflow:hidden; height:220px;">
                <img
                    src="${srcImage}"
                    alt="${escapeHtml(p.name)}"
                    class="card-img-top w-100"
                    style="object-fit:cover; height:100%;"
                    onerror="this.onerror=null;this.src='Images/placeholder.png';"
                />
            </div>
            <div class="card-body d-flex flex-column">
                <h6 class="card-title mb-2">${escapeHtml(p.name)}</h6>
                <p class="mb-1 text-muted small">${escapeHtml(p.description || '')}</p>
                <p class="mb-3 text-muted small">Price: ${formatPrice(p.price)} · Stock: <span class="product-stock">${p.stock}</span></p>
                <div class="mt-auto d-flex gap-2">
                    <button class="btn btn-warning btn-sm add-to-cart rounded-3">Add to Cart</button>
                    <button class="btn btn-outline-danger btn-sm remove-btn rounded-3">Remove</button>
                </div>
            </div>
        `;

        col.appendChild(card);
        row.appendChild(col);

        const addBtn = card.querySelector('.add-to-cart');
        const removeBtn = card.querySelector('.remove-btn');

        const already = cart.find(item => item.name === p.name && item.price === p.price && item.imageUrl === p.imageUrl);
        if (already) {
            addBtn.textContent = 'Added';
            addBtn.disabled = true;
            addBtn.classList.remove('btn-warning');
            addBtn.classList.add('btn-success');
        }

        addBtn.addEventListener('click', function () {
            let current = loadCart();
            const found = current.find(item => item.name === p.name && item.price === p.price && item.imageUrl === p.imageUrl);

            if (!found) {
                if (p.stock <= 0) {
                    Swal.fire({ icon: 'error', title: 'Out of stock' });
                    return;
                }
                current.push({ imageUrl: p.imageUrl, name: p.name, price: p.price, quantity: 1, stock: p.stock });
                saveCart(current);

                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: `"${p.name}" added to cart`,
                    showConfirmButton: false,
                    timer: 1500
                });

                this.textContent = 'Added';
                this.disabled = true;
                this.classList.remove('btn-warning');
                this.classList.add('btn-success');
            } else {
                if (found.quantity < (p.stock || 0)) {
                    found.quantity++;
                    saveCart(current);
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: `Increased quantity of "${p.name}"`,
                        showConfirmButton: false,
                        timer: 1200
                    });
                    this.textContent = 'Added';
                    this.disabled = true;
                    this.classList.remove('btn-warning');
                    this.classList.add('btn-success');
                } else {
                    Swal.fire({ icon: 'error', title: 'Cannot add more — exceeds stock' });
                }
            }
        });

        removeBtn.addEventListener('click', () => {
            Swal.fire({
                title: "Remove product?",
                text: "This removes the product from the product listing (cart copies stay until removed separately).",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, remove it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    const products = loadProducts();
                    const idx = products.findIndex(item => item.name === p.name && item.price === p.price && item.imageUrl === p.imageUrl);
                    if (idx !== -1) {
                        products.splice(idx, 1);
                        saveProducts(products);
                        col.remove();
                    }

                    let current = loadCart();
                    const cartIdx = current.findIndex(item => item.name === p.name && item.imageUrl === p.imageUrl);
                    if (cartIdx !== -1) {
                        current.splice(cartIdx, 1);
                        saveCart(current);
                    }

                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: `"${p.name}" has been removed`,
                        showConfirmButton: false,
                        timer: 1500
                    });
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
}

document.addEventListener('DOMContentLoaded', () => {
    renderProductCards();
    attachLoginHandler();
    window.addEventListener('storage', (ev) => {
        if (ev.key === CartItemStorage || ev.key === ProductsStorage) {
            renderProductCards();
        }
    });
});


// ============================================================
// ============================================================
// ============================================================

function GoToCart() {
    window.location.href = "cart.html";
}

// ============================================================
// ============================================================
// ============================================================

function saveProducts(list) {
    localStorage.setItem(ProductsStorage, JSON.stringify(list));
}

function loadCart() {
    const raw = localStorage.getItem(CartItemStorage);
    return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
    localStorage.setItem(CartItemStorage, JSON.stringify(cart));
}

function formatPrice(n) {
    return `$ ${Number(n).toFixed(2)}`;
}