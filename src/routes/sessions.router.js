import express from 'express';
import passport from 'passport';
import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';

const router = express.Router();

router.post('/register', passport.authenticate('register', {
    failureRedirect: '/register',
    failureFlash: true
}), async (req, res) => {
    try {
        const newCart = await Cart.create({ products: [] });
        await User.findByIdAndUpdate(req.user._id, { cart: newCart._id });
        res.redirect('/login');
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error en el registro' });
    }
});

router.post('/login', passport.authenticate('login', {
    failureRedirect: '/login',
    failureFlash: true
}), async (req, res) => {
    try {
        req.session.login = true;
        req.session.user = req.user;
        res.redirect('/products');
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error en el login' });
    }
});

// Support both GET and POST for logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.redirect('/login');
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.redirect('/login');
    });
});

export default router;
