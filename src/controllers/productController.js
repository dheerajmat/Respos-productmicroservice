import * as ProductService from '../services/productService.js';
import { ValidationError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const getProductToCreateModal = async (req, res, next) => {
    try {
        const modalData = await ProductService.getProductModal(req.user.uoid);
        res.json(modalData);
    } catch (error) {
        logger.error('Error getting product modal:', error);
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const productData = req.body;
        const userData = {
            uid: req.user.uid,
            uoid: req.user.uoid
        };

        const product = await ProductService.createProduct(productData, userData);
        res.status(201).json(product);
    } catch (error) {
        logger.error('Error creating product:', error);
        next(error);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const products = await ProductService.getAllProducts(req.user.uoid);
        res.json(products);
    } catch (error) {
        logger.error('Error getting products:', error);
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const product = await ProductService.getProductById(
            parseInt(req.params.id),
            req.user.uoid
        );
        if (!product) {
            throw new ValidationError('Product not found');
        }
        res.json(product);
    } catch (error) {
        logger.error('Error getting product:', error);
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const productData = req.body;
        const userData = {
            uid: req.user.uid,
            uoid: req.user.uoid
        };

        const product = await ProductService.updateProduct(
            parseInt(req.params.id),
            productData,
            userData
        );
        res.json(product);
    } catch (error) {
        logger.error('Error updating product:', error);
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        await ProductService.deleteProduct(
            parseInt(req.params.id),
            req.user.uid
        );
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        logger.error('Error deleting product:', error);
        next(error);
    }
};

export const filterProducts = async (req, res, next) => {
    try {
        const filters = req.body;
        const products = await ProductService.filterProducts(filters, req.user.uoid);
        res.json(products);
    } catch (error) {
        logger.error('Error filtering products:', error);
        next(error);
    }
    
};

// Variant Controllers
export const createVariant = async (req, res, next) => {
    try {
        const variantData = req.body;
        const userData = {
            uid: req.user.uid,
            uoid: req.user.uoid
        };

        const variant = await ProductService.createVariant(
            parseInt(req.params.productId),
            variantData,
            userData
        );
        res.status(201).json(variant);
    } catch (error) {
        logger.error('Error creating variant:', error);
        next(error);
    }
};

export const getVariants = async (req, res, next) => {
    try {
        const variants = await ProductService.getVariants(parseInt(req.params.productId));
        res.json(variants);
    } catch (error) {
        logger.error('Error getting variants:', error);
        next(error);
    }
};

export const getVariantById = async (req, res, next) => {
    try {
        const variant = await ProductService.getVariantById(
            parseInt(req.params.productId),
            parseInt(req.params.variantId)
        );
        if (!variant) {
            throw new ValidationError('Variant not found');
        }
        res.json(variant);
    } catch (error) {
        logger.error('Error getting variant:', error);
        next(error);
    }
};

export const updateVariant = async (req, res, next) => {
    try {
        const variantData = req.body;
        const userData = {
            uid: req.user.uid,
            uoid: req.user.uoid
        };

        const variant = await ProductService.updateVariant(
            parseInt(req.params.productId),
            parseInt(req.params.variantId),
            variantData,
            userData
        );
        res.json(variant);
    } catch (error) {
        logger.error('Error updating variant:', error);
        next(error);
    }
};

export const deleteVariant = async (req, res, next) => {
    try {
        await ProductService.deleteVariant(
            parseInt(req.params.productId),
            parseInt(req.params.variantId),
            req.user.uid
        );
        res.json({ message: 'Variant deleted successfully' });
    } catch (error) {
        logger.error('Error deleting variant:', error);
        next(error);
    }
};

export const createFixedAsset = async (req, res, next) => {
    try {
        const fixedAssetData = req.body;
        const userData = {
            uid: req.user.uid,
            uoid: req.user.uoid
        };

        const product = await ProductService.createFixedAsset(fixedAssetData, userData);
        res.status(201).json(product);
    } catch (error) {
        logger.error('Error creating fixed asset:', error);
        next(error);
    }
};

export const getFixedAssetById = async (req, res, next) => {
    try {
        const product = await ProductService.getFixedAssetById(
            parseInt(req.params.id),
            req.user.uoid
        );
        if (!product) {
            throw new ValidationError('Fixed asset not found');
        }
        res.json(product);
    } catch (error) {
        logger.error('Error getting fixed asset:', error);
        next(error);
    }
};

export const updateFixedAsset = async (req, res, next) => {
    try {
        const fixedAssetData = req.body;
        const userData = {
            uid: req.user.uid,
            uoid: req.user.uoid
        };

        const product = await ProductService.updateFixedAsset(
            parseInt(req.params.id),
            fixedAssetData,
            userData
        );
        res.json(product);
    } catch (error) {
        logger.error('Error updating fixed asset:', error);
        next(error);
    }
};

export const getFixedAssetModal = async (req, res, next) => {
    try {
        const modalData = await ProductService.getFixedAssetModal(req.user.uoid);
        res.json(modalData);
    } catch (error) {
        logger.error('Error getting fixed asset modal:', error);
        next(error);
    }
};