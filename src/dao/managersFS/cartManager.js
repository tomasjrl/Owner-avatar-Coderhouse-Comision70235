import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CartFileManager {
    constructor() {
        this.path = join(__dirname, '../../../data/carts.json');
        this.initializeFile();
    }

    async initializeFile() {
        try {
            await fs.access(this.path);
        } catch {
            await fs.mkdir(dirname(this.path), { recursive: true });
            await fs.writeFile(this.path, '[]');
        }
    }

    async createCart() {
        try {
            const carts = await this.getAllCarts();
            const newCart = {
                _id: Date.now().toString(),
                products: []
            };
            carts.push(newCart);
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return newCart;
        } catch (error) {
            throw new Error('Error al crear carrito: ' + error.message);
        }
    }

    async getAllCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error al leer carritos: ' + error.message);
        }
    }

    async getCart(cartId) {
        try {
            const carts = await this.getAllCarts();
            return carts.find(c => c._id === cartId);
        } catch (error) {
            throw new Error('Error al obtener carrito: ' + error.message);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const carts = await this.getAllCarts();
            const cartIndex = carts.findIndex(c => c._id === cartId);
            if (cartIndex === -1) throw new Error('Carrito no encontrado');

            const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId);

            if (productIndex >= 0) {
                carts[cartIndex].products[productIndex].quantity += quantity;
            } else {
                carts[cartIndex].products.push({ product: productId, quantity });
            }

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return carts[cartIndex];
        } catch (error) {
            throw new Error('Error al agregar producto al carrito: ' + error.message);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const carts = await this.getAllCarts();
            const cartIndex = carts.findIndex(c => c._id === cartId);
            if (cartIndex === -1) throw new Error('Carrito no encontrado');

            carts[cartIndex].products = carts[cartIndex].products.filter(p => p.product !== productId);
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return carts[cartIndex];
        } catch (error) {
            throw new Error('Error al eliminar producto del carrito: ' + error.message);
        }
    }

    async updateCart(cartId, products) {
        try {
            const carts = await this.getAllCarts();
            const cartIndex = carts.findIndex(c => c._id === cartId);
            if (cartIndex === -1) throw new Error('Carrito no encontrado');

            carts[cartIndex].products = products;
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return carts[cartIndex];
        } catch (error) {
            throw new Error('Error al actualizar carrito: ' + error.message);
        }
    }

    async clearCart(cartId) {
        try {
            const carts = await this.getAllCarts();
            const cartIndex = carts.findIndex(c => c._id === cartId);
            if (cartIndex === -1) throw new Error('Carrito no encontrado');

            carts[cartIndex].products = [];
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return carts[cartIndex];
        } catch (error) {
            throw new Error('Error al vaciar carrito: ' + error.message);
        }
    }
}

export default CartFileManager;
