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
            const { quantity = 1 } = req.body;
            const updatedCart = await cartManager.addProductToCart(
                req.params.cid,
                req.params.pid,
                quantity
            );
            res.json({ status: 'success', data: updatedCart });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
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
