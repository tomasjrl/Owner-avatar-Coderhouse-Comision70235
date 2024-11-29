import express from 'express';
import ProductManager from "../dao/managersDB/productManager.js";
import CartManager from "../dao/managersDB/cartManager.js";
import { isAuthenticated, isNotAuthenticated, isAdmin } from "../middlewares/auth.js";

const viewsRouter = express.Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// Public routes
viewsRouter.get('/', (req, res) => {
    res.render('index', { 
        user: req.session.user,
        title: 'Home'
    });
});

viewsRouter.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login', { title: 'Login' });
});

viewsRouter.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register', { title: 'Register' });
});

// Protected routes
viewsRouter.get('/products', isAuthenticated, async (req, res) => {
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
        let sortOptions = {};
        if (sort === 'asc') {
            sortOptions.price = 1;
        } else if (sort === 'desc') {
            sortOptions.price = -1;
        }

        // Get paginated products
        const result = await productManager.getAllProducts({
            filter,
            sort: sortOptions,
            page,
            limit
        });

        // Get all categories for filter dropdown
        const allProducts = await productManager.getAllProducts({ limit: 1000 });
        const categories = [...new Set(allProducts.docs.map(product => product.category))];

        res.render('products', {
            products: result.docs,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            categories,
            currentCategory: category,
            currentSort: sort,
            currentQuery: query,
            user: req.session.user,
            title: 'Products'
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).render('error', { 
            error: 'Error al cargar los productos',
            user: req.session.user
        });
    }
});

viewsRouter.get('/products/:pid', isAuthenticated, async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        if (product) {
            res.render('product-details', { 
                product,
                user: req.session.user,
                title: product.title
            });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

viewsRouter.get('/carts/:cid', isAuthenticated, async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        if (!cart) {
            return res.status(404).render('error', { 
                error: 'Carrito no encontrado',
                user: req.session.user
            });
        }
        const products = cart.products.map(item => ({
            ...item.product.toObject(),
            quantity: item.quantity,
            id: item.product._id
        }));

        res.render('cart-details', { 
            products,
            cart,
            user: req.session.user,
            title: 'Cart Details'
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).render('error', { 
            error: 'Error al cargar el carrito',
            user: req.session.user
        });
    }
});

viewsRouter.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { 
        user: req.session.user,
        title: 'Profile'
    });
});

viewsRouter.get('/realtimeproducts', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const result = await productManager.getAllProducts({ limit: 100 });
        res.render('realTimeProducts', { 
            products: result.docs,
            user: req.session.user,
            title: 'Real Time Products'
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).render('error', { 
            error: 'Error al cargar los productos',
            user: req.session.user
        });
    }
});

export default viewsRouter;
