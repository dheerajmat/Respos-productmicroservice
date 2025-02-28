import * as prowastageService from '../services/prowastageService.js';
import { ValidationError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const createWastage = async (req, res, next) => {
    try {
        const wastageData = {
            ...req.body,
            createdby: req.user.uid,
            uoid: req.user.uoid
        };

        const wastage = await prowastageService.createWastage(
            wastageData,
            req.body.attachments
        );

        res.status(201).json({
            success: true,
            data: wastage
        });
    } catch (error) {
        logger.error('Error in prowastageController.createWastage:', error);
        next(error);
    }
};

export const getWastage = async (req, res, next) => {
    try {
        const wastage = await prowastageService.getWastageById(req.params.id);
        if (!wastage) {
            throw new ValidationError('Wastage not found');
        }

        res.json({
            success: true,
            data: wastage
        });
    } catch (error) {
        logger.error('Error in prowastageController.getWastage:', error);
        next(error);
    }
};

export const getWastageModal = async (req, res, next) => {
    try {
        const proisfa = req.query.proisfa === 'true';
        const modalData = await prowastageService.getWastageModal(proisfa);
        res.json({
            success: true,
            data: modalData
        });
    } catch (error) {
        logger.error('Error in prowastageController.getWastageModal:', error);
        next(error);
    }
};

export const updateWastage = async (req, res, next) => {
    try {
        const updateData = {
            ...req.body,
            modifiedby: req.user.uid
        };

        const wastage = await prowastageService.updateWastage(
            req.params.id,
            updateData
        );

        if (!wastage) {
            throw new ValidationError('Wastage record not found');
        }

        res.json({
            success: true,
            data: wastage
        });
    } catch (error) {
        logger.error('Error in prowastageController.updateWastage:', error);
        next(error);
    }
};

export const deleteWastage = async (req, res, next) => {
    try {
        const wastage = await prowastageService.deleteWastage(
            req.params.id,
            req.user.uid
        );

        if (!wastage) {
            throw new ValidationError('Wastage record not found');
        }

        res.json({
            success: true,
            message: 'Wastage record deleted successfully'
        });
    } catch (error) {
        logger.error('Error in prowastageController.deleteWastage:', error);
        next(error);
    }
};

export const listWastages = async (req, res, next) => {
    try {
        const filters = {
            ...req.body,
            uoid: req.user.uoid,
            proisfa: req.body.proisfa !== undefined ? req.body.proisfa : undefined
        };

        const result = await prowastageService.listWastages(filters);

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Error in prowastageController.listWastages:', error);
        next(error);
    }
}; 