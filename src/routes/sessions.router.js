import express from 'express';
import passport from 'passport';
import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const PRIVATE_KEY = 'CoderSecretJWT';

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
        const user = req.user;
        const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' });
        res.cookie('coderCookieToken', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        res.redirect('/');
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error en el login' });
    }
});

// Support both GET and POST for logout
router.get('/logout', (req, res) => {
    res.clearCookie('coderCookieToken'); // Elimina la cookie JWT
    res.redirect('/login');
});

router.post('/logout', (req, res) => {
    res.clearCookie('coderCookieToken'); // Elimina la cookie JWT
    res.redirect('/login');
});

// Endpoint current para obtener el usuario actual
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                status: 'error',
                error: 'No hay usuario autenticado'
            });
        }

        // Filtramos la información sensible antes de enviarla
        const user = {
            id: req.user._id,
            email: req.user.email,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            role: req.user.role,
            cart: req.user.cart
        };

        res.json({ 
            status: 'success',
            message: 'Usuario actual recuperado con éxito',
            user: user
        });
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Error al obtener el usuario actual',
            details: error.message
        });
    }
});

export default router;
