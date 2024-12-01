import express from 'express';
import CartManager from '../dao/managersDB/cartManager.js';
import CartFileManager from '../dao/managersFS/cartManager.js';
import { isAuthenticated, isUser } from '../middlewares/auth.js';

const cartRouter = (useMongoDBForCarts = true) => {
    const router = express.Router();
    const cartManager = useMongoDBForCarts
        ? new CartManager()
        : new CartFileManager();

    router.use(isAuthenticated);

    // Crear un nuevo carrito
    router.post('/', isUser, async (req, res) => {
        try {
            const newCart = await cartManager.createCart();
            res.status(201).json({ status: 'success', data: newCart });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    // Obtener un carrito por ID
    router.get('/:cid', isUser, async (req, res) => {
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
    router.post('/:cid/product/:pid', isUser, async (req, res) => {
        try {
            let quantity = 1;
            
            // Validar que el carrito pertenece al usuario
            if (req.params.cid !== req.user.cart.toString()) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permiso para modificar este carrito'
                });
            }

            // Validar el ID del producto
            if (!req.params.pid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'ID de producto no proporcionado'
                });
            }

            // Si se proporciona una cantidad en el body, usarla
            if (req.body && req.body.quantity) {
                quantity = parseInt(req.body.quantity);
                if (isNaN(quantity) || quantity < 1) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'La cantidad debe ser un número válido mayor a 0'
                    });
                }
            }

            const result = await cartManager.addProductToCart(req.params.cid, req.params.pid, quantity);
            res.json({ 
                status: 'success', 
                message: 'Producto agregado al carrito exitosamente',
                data: result 
            });
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            res.status(500).json({ 
                status: 'error', 
                message: 'Error al agregar producto al carrito',
                details: error.message 
            });
        }
    });

    // Eliminar un producto del carrito
    router.delete('/:cid/product/:pid', isUser, async (req, res) => {
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
    router.put('/:cid', isUser, async (req, res) => {
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
    router.delete('/:cid', isUser, async (req, res) => {
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
