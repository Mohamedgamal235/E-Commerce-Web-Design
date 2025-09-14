const CartItemStorage = 'cartItems';

let Products = [
    { imageUrl: "Images/The-Classic-Trench.png", name: "The Classic Trench", price: 350.00 },
    { imageUrl: "Images/Silk Scarf.png", name: "Silk Scarf", price: 120.00 },
    { imageUrl: "Images/bag.png", name: "Leather Tote Bag", price: 480.00 },
    { imageUrl: "Images/sweetshert.png", name: "Cashmere Sweater", price: 290.00 },
    { imageUrl: "Images/dress.png", name: "Evening Dress", price: 650.00 },
    { imageUrl: "Images/watch.png", name: "Luxury Watch", price: 900.00 },
    { imageUrl: "Images/shose1.png", name: "Leather Shoes", price: 220.00 },
    { imageUrl: "Images/hat.png", name: "Classic Hat", price: 80.00 },
    { imageUrl: "Images/perfum.png", name: "Luxury Perfume", price: 150.00 }
];

function loadCart() {
    const raw = localStorage.getItem(CartItemStorage);
    return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
    localStorage.setItem(CartItemStorage, JSON.stringify(cart));
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".ProdcutCards");
    if (!section) return;

    let container = document.createElement("div");
    container.className = "container py-5";
    let row = document.createElement("div");
    row.className = "row g-4";
    container.appendChild(row);
    section.appendChild(container);

    const cart = loadCart();

    Products.forEach((p) => {
        let col = document.createElement("div");
        col.className = "col-12 col-sm-12 col-md-4 col-lg-3";

        let card = document.createElement("div");
        card.className = "card h-100 shadow";

        let srcImage = encodeURI(p.imageUrl || 'Images/placeholder.png');

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
                <p class="mb-3 text-muted small">$${p.price.toFixed(2)}</p>
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


        let alreadyInCart = cart.find(item => item.name === p.name && item.price === p.price && item.imageUrl === p.imageUrl);
        if (alreadyInCart) {
            addBtn.textContent = 'Added';
            addBtn.disabled = true;
            addBtn.classList.remove('btn-warning');
            addBtn.classList.add('btn-success');
        }

        addBtn.addEventListener("click", function () {
            let current = loadCart();
            let found = current.find(item => item.name === p.name && item.price === p.price && item.imageUrl === p.imageUrl);
            if (!found) {

                current.push({ imageUrl: p.imageUrl, name: p.name, price: p.price, quantity: 1 });
                saveCart(current); // soave on localstorage 

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
                Swal.fire({
                    position: "center",
                    icon: "info",
                    title: "This product is already in the cart",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });

        removeBtn.addEventListener("click", () => {
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
                    col.remove();
                    let current = loadCart();

                    const idx = current.findIndex(item => item.name === p.name && item.price === p.price && item.imageUrl === p.imageUrl);
                    if (idx !== -1) {
                        current.splice(idx, 1);
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
                        timer: 1500
                    });
                }
            });
        });
    });
});
