import express from 'express';
import ProductManager from '../dao/managersDB/productManager.js';
import ProductFileManager from '../dao/managersFS/productManager.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.js';

const checkAdmin = (req, res, next) => {
    if (req.session?.user?.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
};

const productRouter = (useMongoDBForProducts = true) => {
    const router = express.Router();
    const productManager = useMongoDBForProducts
        ? new ProductManager()
        : new ProductFileManager();

    router.use(isAuthenticated);

    // Obtener todos los productos
    router.get('/', async (req, res) => {
        try {
            const { page = 1, limit = 10, sort, query, category } = req.query;
            
            // Build filter object
            let filter = {};
            if (query) {
                filter.$or = [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ];
            }
            if (category) {
                filter.category = category;
            }

            // Build sort object
            let sortObj = {};
            if (sort === 'asc') {
                sortObj.price = 1;
            } else if (sort === 'desc') {
                sortObj.price = -1;
            }

            const result = await productManager.getAllProducts({
                filter,
                sort: sortObj,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage
            });
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    });

    // Obtener un producto por ID
    router.get('/:pid', async (req, res) => {
        try {
            const product = await productManager.getProductById(req.params.pid);
            if (!product) {
                return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
            }
            res.json({ status: 'success', product });
        } catch (error) {
            console.error('Error getting product:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    });

    router.use(isAdmin);

    // Crear un nuevo producto (solo admin)
    router.post('/', async (req, res) => {
        try {
            const newProduct = await productManager.addProduct(req.body);
            res.status(201).json({ status: 'success', product: newProduct });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    });

    // Actualizar un producto (solo admin)
    router.put('/:pid', async (req, res) => {
        try {
            const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
            if (!updatedProduct) {
                return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
            }
            res.json({ status: 'success', product: updatedProduct });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    });

    // Eliminar un producto (solo admin)
    router.delete('/:pid', async (req, res) => {
        try {
            const result = await productManager.deleteProduct(req.params.pid);
            if (!result) {
                return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
            }
            res.json({ status: 'success', message: 'Producto eliminado correctamente' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    });

    return router;
};

export default productRouter;
