import express from 'express';
import ProductManager from "../dao/managersDB/productManager.js";
import CartManager from "../dao/managersDB/cartManager.js";
import User from "../models/user.model.js";
import { isAuthenticated, isNotAuthenticated, isAdmin } from "../middlewares/auth.js";

const viewsRouter = express.Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// Public routes
viewsRouter.get('/', (req, res) => {
    res.render('index', { 
        user: req.user,
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
        
        // Ensure user has a cart
        if (!req.user.cart) {
            const newCart = await cartManager.createCart();
            req.user.cart = newCart._id;
            await User.findByIdAndUpdate(req.user._id, { cart: newCart._id });
        }
        
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
            user: req.user,
            title: 'Products'
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).render('error', { 
            error: 'Error al cargar los productos',
            title: 'Error'
        });
    }
});

viewsRouter.get('/products/:pid', isAuthenticated, async (req, res) => {
    try {
        // Ensure user has a cart
        if (!req.user.cart) {
            const newCart = await cartManager.createCart();
            req.user.cart = newCart._id;
            await User.findByIdAndUpdate(req.user._id, { cart: newCart._id });
        }

        const product = await productManager.getProductById(req.params.pid);
        if (product) {
            res.render('product', { 
                product,
                user: req.user,
                title: product.title
            });
        } else {
            res.status(404).render('error', {
                error: 'Producto no encontrado',
                title: 'Error'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', {
            error: 'Error al cargar el producto',
            title: 'Error'
        });
    }
});

viewsRouter.get('/carts/:cid', isAuthenticated, async (req, res) => {
    try {
        const cart = await cartManager.getCart(req.params.cid);
        if (!cart) {
            return res.status(404).render('error', { 
                error: 'Carrito no encontrado',
                title: 'Error'
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
            user: req.user,
            title: 'Cart Details'
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).render('error', { 
            error: 'Error al cargar el carrito',
            title: 'Error'
        });
    }
});

viewsRouter.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { 
        user: req.user,
        title: 'Profile'
    });
});

viewsRouter.get('/realtimeproducts', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const result = await productManager.getAllProducts({ limit: 100 });
        res.render('realTimeProducts', { 
            products: result.docs,
            user: req.user,
            title: 'Real Time Products'
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).render('error', { 
            error: 'Error al cargar los productos',
            title: 'Error'
        });
    }
});

export default viewsRouter;
