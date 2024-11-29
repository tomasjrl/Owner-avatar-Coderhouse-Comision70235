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

            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

            if (productIndex >= 0) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
            return cart;
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
