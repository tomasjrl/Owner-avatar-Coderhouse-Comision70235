const socket = io();

// Manejo de productos en tiempo real
socket.on('products', (products) => {
    updateProductList(products);
});

function updateProductList(products) {
    const productList = document.querySelector('#productList');
    if (!productList) return;

    productList.innerHTML = '';
    products.forEach(product => {
        const productElement = createProductElement(product);
        productList.appendChild(productElement);
    });
}

function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'col-md-4 mb-4';
    div.innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text"><strong>Precio:</strong> $${product.price}</p>
                <p class="card-text"><strong>Stock:</strong> ${product.stock}</p>
                <p class="card-text"><strong>Categoría:</strong> ${product.category}</p>
                <div class="d-grid gap-2">
                    <a href="/products/${product._id}" class="btn btn-info">Ver detalles</a>
                    <button class="btn btn-primary add-to-cart" data-product-id="${product._id}">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </div>
    `;
    return div;
}

// Manejo de formularios
document.addEventListener('DOMContentLoaded', function() {
    // Formulario de productos
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(productForm);
            const productData = {};
            formData.forEach((value, key) => {
                productData[key] = value;
            });

            try {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });

                if (response.ok) {
                    alert('Producto agregado exitosamente');
                    productForm.reset();
                    socket.emit('getProducts');
                } else {
                    throw new Error('Error al agregar producto');
                }
            } catch (error) {
                alert('Error al agregar el producto');
                console.error('Error:', error);
            }
        });
    }

    // Manejo de errores
    socket.on('error', (error) => {
        console.error('Error del servidor:', error);
        alert('Error: ' + error.message);
    });
});
