import Cart from '../../models/cart.model.js';
import mongoose from 'mongoose';

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
            // Convertir IDs a ObjectId
            const cartObjectId = new mongoose.Types.ObjectId(cartId);
            const productObjectId = new mongoose.Types.ObjectId(productId);

            // Primero, buscar si el producto ya existe en el carrito
            const existingCart = await Cart.findOne({
                _id: cartObjectId,
                'products.product': productObjectId
            });

            if (existingCart) {
                // Si el producto existe, actualizar su cantidad
                const updatedCart = await Cart.findOneAndUpdate(
                    {
                        _id: cartObjectId,
                        'products.product': productObjectId
                    },
                    {
                        $inc: { 'products.$.quantity': quantity }
                    },
                    { new: true }
                ).populate('products.product');

                return updatedCart;
            } else {
                // Si el producto no existe, agregarlo al carrito
                const updatedCart = await Cart.findByIdAndUpdate(
                    cartObjectId,
                    {
                        $push: {
                            products: {
                                product: productObjectId,
                                quantity: quantity
                            }
                        }
                    },
                    { new: true }
                ).populate('products.product');

                return updatedCart;
            }
        } catch (error) {
            console.error('Error en addProductToCart:', error);
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
