import Cart from '../../models/cart.model.js';

class CartManager {
    async createCart() {
        try {
            const cart = new Cart({ products: [] });
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error('Error al crear carrito: ' + error.message);
        }
    }

    async getCart(cartId) {
        try {
            return await Cart.findById(cartId).populate('products.product');
        } catch (error) {
            throw new Error('Error al obtener carrito: ' + error.message);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            // Buscar el producto en el carrito
            const existingProduct = cart.products.find(p => p.product && p.product.toString() === productId);

            if (existingProduct) {
                // Si el producto ya existe, actualizar su cantidad
                existingProduct.quantity += quantity;
            } else {
                // Si el producto no existe, agregarlo al carrito
                cart.products.push({ product: productId, quantity });
            }

            // Guardar los cambios
            await cart.save();
            
            // Retornar el carrito populado
            return await Cart.findById(cartId).populate('products.product');
        } catch (error) {
            throw new Error('Error al agregar producto al carrito: ' + error.message);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            cart.products = cart.products.filter(p => p.product.toString() !== productId);
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error('Error al eliminar producto del carrito: ' + error.message);
        }
    }

    async updateCart(cartId, products) {
        try {
            return await Cart.findByIdAndUpdate(
                cartId,
                { products },
                { new: true }
            ).populate('products.product');
        } catch (error) {
            throw new Error('Error al actualizar carrito: ' + error.message);
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            cart.products = [];
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error('Error al vaciar carrito: ' + error.message);
        }
    }
}

export default CartManager;
