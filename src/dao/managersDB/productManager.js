import Product from '../../models/product.model.js';

class ProductManager {
    async addProduct(productData) {
        try {
            const product = new Product(productData);
            await product.save();
            return product;
        } catch (error) {
            throw new Error('Error al agregar producto: ' + error.message);
        }
    }

    async getAllProducts({ filter = {}, sort = {}, page = 1, limit = 10 } = {}) {
        try {
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: sort,
                lean: true
            };

            // Try to use pagination if available
            if (typeof Product.paginate === 'function') {
                const result = await Product.paginate(filter, options);
                return {
                    docs: result.docs,
                    totalDocs: result.totalDocs,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    page: result.page,
                    pagingCounter: result.pagingCounter,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage,
                    prevPage: result.prevPage,
                    nextPage: result.nextPage
                };
            } else {
                // Fallback to regular find if paginate is not available
                let query = Product.find(filter).lean();
                
                if (sort && Object.keys(sort).length > 0) {
                    query = query.sort(sort);
                }
                
                const totalDocs = await Product.countDocuments(filter);
                const totalPages = Math.ceil(totalDocs / limit);
                const skip = (page - 1) * limit;
                
                const docs = await query.skip(skip).limit(limit);
                
                return {
                    docs,
                    totalDocs,
                    limit,
                    totalPages,
                    page,
                    pagingCounter: skip + 1,
                    hasPrevPage: page > 1,
                    hasNextPage: page < totalPages,
                    prevPage: page > 1 ? page - 1 : null,
                    nextPage: page < totalPages ? page + 1 : null
                };
            }
        } catch (error) {
            throw new Error('Error al obtener productos: ' + error.message);
        }
    }

    async getProductById(id) {
        try {
            const product = await Product.findById(id).lean();
            return product;
        } catch (error) {
            throw new Error('Error al obtener producto: ' + error.message);
        }
    }

    async updateProduct(id, updateData) {
        try {
            const product = await Product.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).lean();
            return product;
        } catch (error) {
            throw new Error('Error al actualizar producto: ' + error.message);
        }
    }

    async deleteProduct(id) {
        try {
            const product = await Product.findByIdAndDelete(id).lean();
            return product;
        } catch (error) {
            throw new Error('Error al eliminar producto: ' + error.message);
        }
    }
}

export default ProductManager;
