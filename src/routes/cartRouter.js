import express from 'express';
import CartManager from '../dao/managersDB/cartManager.js';
import CartFileManager from '../dao/managersFS/cartManager.js';
import { isAuthenticated, isUser } from '../middleware/auth.js';

const cartRouter = (useMongoDBForCarts = true) => {
    const router = express.Router();
    const cartManager = useMongoDBForCarts
        ? new CartManager()
        : new CartFileManager();

    router.use(isAuthenticated);

    // Crear un nuevo carrito
    router.post('/', async (req, res) => {
        try {
            const newCart = await cartManager.createCart();
            res.status(201).json({ status: 'success', data: newCart });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    // Obtener un carrito por ID
    router.get('/:cid', async (req, res) => {
        try {
            const cart = await cartManager.getCart(req.params.cid);
            if (!cart) {
                return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
            }
            res.json({ status: 'success', data: cart });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    // Agregar un producto al carrito
    router.post('/:cid/product/:pid', async (req, res) => {
        try {
            let quantity = 1;
            
            // Validar el ID del carrito
            if (!req.params.cid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'ID de carrito no proporcionado'
                });
            }

            // Validar el ID del producto
            if (!req.params.pid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'ID de producto no proporcionado'
                });
            }

            // Validar y parsear la cantidad
            if (req.body && typeof req.body.quantity !== 'undefined') {
                quantity = parseInt(req.body.quantity, 10);
                if (isNaN(quantity) || quantity < 1) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'La cantidad debe ser un número válido mayor a 0'
                    });
                }
            }

            // Intentar agregar el producto al carrito
            const updatedCart = await cartManager.addProductToCart(
                req.params.cid,
                req.params.pid,
                quantity
            );

            // Encontrar el producto específico en el carrito actualizado
            const addedProduct = updatedCart.products.find(
                p => p.product._id.toString() === req.params.pid
            );

            // Preparar la respuesta
            const response = {
                status: 'success',
                message: 'Producto actualizado en el carrito exitosamente',
                data: {
                    cartId: updatedCart._id,
                    updatedProduct: addedProduct ? {
                        productId: addedProduct.product._id,
                        title: addedProduct.product.title,
                        quantity: addedProduct.quantity,
                        price: addedProduct.product.price
                    } : null,
                    totalProducts: updatedCart.products.length,
                    totalQuantity: updatedCart.products.reduce((sum, p) => sum + p.quantity, 0)
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error adding product to cart:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Error al agregar producto al carrito'
            });
        }
    });

    // Eliminar un producto del carrito
    router.delete('/:cid/product/:pid', async (req, res) => {
        try {
            const updatedCart = await cartManager.removeProductFromCart(
                req.params.cid,
                req.params.pid
            );
            res.json({ status: 'success', data: updatedCart });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    // Actualizar el carrito completo
    router.put('/:cid', async (req, res) => {
        try {
            const updatedCart = await cartManager.updateCart(
                req.params.cid,
                req.body.products
            );
            res.json({ status: 'success', data: updatedCart });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    // Vaciar el carrito
    router.delete('/:cid', async (req, res) => {
        try {
            const emptyCart = await cartManager.clearCart(req.params.cid);
            res.json({ status: 'success', data: emptyCart });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    return router;
};

export default cartRouter;
