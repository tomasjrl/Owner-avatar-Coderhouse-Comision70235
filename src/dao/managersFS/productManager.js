import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ProductFileManager {
    constructor() {
        this.path = join(__dirname, '../../../data/products.json');
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

    async getAllProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error al leer productos: ' + error.message);
        }
    }

    async addProduct(productData) {
        try {
            const products = await this.getAllProducts();
            const newProduct = {
                ...productData,
                _id: Date.now().toString(),
            };
            products.push(newProduct);
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));
            return newProduct;
        } catch (error) {
            throw new Error('Error al agregar producto: ' + error.message);
        }
    }

    async getProductById(id) {
        try {
            const products = await this.getAllProducts();
            return products.find(p => p._id === id);
        } catch (error) {
            throw new Error('Error al obtener producto: ' + error.message);
        }
    }

    async updateProduct(id, updateData) {
        try {
            const products = await this.getAllProducts();
            const index = products.findIndex(p => p._id === id);
            if (index === -1) return null;

            products[index] = { ...products[index], ...updateData };
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));
            return products[index];
        } catch (error) {
            throw new Error('Error al actualizar producto: ' + error.message);
        }
    }

    async deleteProduct(id) {
        try {
            const products = await this.getAllProducts();
            const filteredProducts = products.filter(p => p._id !== id);
            await fs.writeFile(this.path, JSON.stringify(filteredProducts, null, 2));
            return true;
        } catch (error) {
            throw new Error('Error al eliminar producto: ' + error.message);
        }
    }
}

export default ProductFileManager;
