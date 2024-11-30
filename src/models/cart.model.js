import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true
        },
        quantity: { 
            type: Number, 
            required: true, 
            default: 1,
            min: [1, 'La cantidad debe ser al menos 1']
        }
    }]
}, {
    timestamps: true
});

// Asegurar que los productos en el carrito sean únicos
cartSchema.index({ 'products.product': 1 });

// Middleware para popular productos
cartSchema.pre('find', function() {
    this.populate('products.product');
});

cartSchema.pre('findOne', function() {
    this.populate('products.product');
});

cartSchema.pre('save', function(next) {
    // Eliminar duplicados basados en el ID del producto
    const uniqueProducts = [];
    const productIds = new Set();
    
    this.products.forEach(item => {
        const productId = item.product.toString();
        if (!productIds.has(productId)) {
            productIds.add(productId);
            uniqueProducts.push(item);
        } else {
            // Si encuentra un duplicado, suma la cantidad al producto existente
            const existingProduct = uniqueProducts.find(
                p => p.product.toString() === productId
            );
            if (existingProduct) {
                existingProduct.quantity += item.quantity;
            }
        }
    });
    
    this.products = uniqueProducts;
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
