import * as prowastageRepository from '../repositories/prowastageRepository.js';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

export const createWastage = async (wastageData, attachments = []) => {
    try {
        return await prowastageRepository.createWastage(wastageData, attachments);
    } catch (error) {
        logger.error('Error in prowastageService.createWastage:', error);
        throw error;
    }
};

export const getWastageById = async (wastageid) => {
    try {
        return await prowastageRepository.getWastageById(wastageid);
    } catch (error) {
        logger.error('Error in prowastageService.getWastageById:', error);
        throw error;
    }
};

export const updateWastage = async (wastageid, updateData) => {
    try {
        return await prowastageRepository.updateWastage(wastageid, updateData);
    } catch (error) {
        logger.error('Error in prowastageService.updateWastage:', error);
        throw error;
    }
};

export const deleteWastage = async (wastageid, deletedby) => {
    try {
        return await prowastageRepository.deleteWastage(wastageid, deletedby);
    } catch (error) {
        logger.error('Error in prowastageService.deleteWastage:', error);
        throw error;
    }
};

export const listWastages = async (filters) => {
    try {
        const { proisfa, ...otherFilters } = filters;
        
        // Add proisfa condition to where clause if it's provided
        const whereClause = { ...otherFilters };
        if (proisfa !== undefined) {
            whereClause.proisfa = proisfa;
        }
        
        return await prowastageRepository.listWastages(whereClause);
    } catch (error) {
        logger.error('Error in prowastageService.listWastages:', error);
        throw error;
    }
};

export const getWastageModal = async (proisfa) => {
    try {
        // Base where condition
        const baseWhere = {
            isdeleted: false,
        };

        // Add proisfa condition if it's provided
        if (proisfa !== undefined) {
            baseWhere.proisfa = proisfa;
        }

        let products;
        if (proisfa) {
            // If proisfa is true, get all products with proisfa=true without categorization
            products = await prisma.product.findMany({
                where: baseWhere,
                select: {
                    proid: true,
                    proname: true,
                    proconfig: true,
                    prouom: true,
                    unitofmeasure: {
                        select: {
                            uomname: true
                        }
                    },
                    provariants: {
                        where: {
                            isdeleted: false
                        },
                        select: {
                            pvid: true,
                            pvname: true,
                            pvbarcode: true
                        }
                    }
                }
            }).then(products => products.map(product => ({
                proid: product.proid,
                proname: product.proname,
                proconfig: product.proconfig,
                prouom: product.prouom,
                prouomname: product.unitofmeasure?.uomname,
                variants: product.provariants.map(variant => ({
                    pvid: variant.pvid,
                    variantname: variant.pvname,
                    pvcode: variant.pvbarcode
                }))
            })));
        } else {
            // If proisfa is false or undefined, keep the original categorized structure
            const [rawMaterials, finishedGoods, semiFinishedGoods] = await Promise.all([
                // Raw Materials (proconfig: 12)
                prisma.product.findMany({
                    where: {
                        ...baseWhere,
                        proconfig: 12
                    },
                    select: {
                        proid: true,
                        proname: true,
                        proconfig: true,
                        prouom: true,
                        unitofmeasure: {
                            select: {
                                uomname: true
                            }
                        },
                        provariants: {
                            where: {
                                isdeleted: false
                            },
                            select: {
                                pvid: true,
                                pvname: true,
                                pvbarcode: true
                            }
                        }
                    }
                }).then(products => products.map(product => ({
                    proid: product.proid,
                    proname: product.proname,
                    proconfig: product.proconfig,
                    prouom: product.prouom,
                    prouomname: product.unitofmeasure?.uomname,
                    variants: product.provariants.map(variant => ({
                        pvid: variant.pvid,
                        variantname: variant.pvname,
                        pvcode: variant.pvbarcode
                    }))
                }))),

                // Finished Goods (proconfig: 14)
                prisma.product.findMany({
                    where: {
                        ...baseWhere,
                        proconfig: 14
                    },
                    select: {
                        proid: true,
                        proname: true,
                        proconfig: true,
                        prouom: true,
                        unitofmeasure: {
                            select: {
                                uomname: true
                            }
                        },
                        provariants: {
                            where: {
                                isdeleted: false
                            },
                            select: {
                                pvid: true,
                                pvname: true,
                                pvbarcode: true
                            }
                        }
                    }
                }).then(products => products.map(product => ({
                    proid: product.proid,
                    proname: product.proname,
                    proconfig: product.proconfig,
                    prouom: product.prouom,
                    prouomname: product.unitofmeasure?.uomname,
                    variants: product.provariants.map(variant => ({
                        pvid: variant.pvid,
                        variantname: variant.pvname,
                        pvcode: variant.pvbarcode
                    }))
                }))),

                // Semi-finished Goods (proconfig: 13)
                prisma.product.findMany({
                    where: {
                        ...baseWhere,
                        proconfig: 13
                    },
                    select: {
                        proid: true,
                        proname: true,
                        proconfig: true,
                        prouom: true,
                        unitofmeasure: {
                            select: {
                                uomname: true
                            }
                        },
                        provariants: {
                            where: {
                                isdeleted: false
                            },
                            select: {
                                pvid: true,
                                pvname: true,
                                pvbarcode: true
                            }
                        }
                    }
                }).then(products => products.map(product => ({
                    proid: product.proid,
                    proname: product.proname,
                    proconfig: product.proconfig,
                    prouom: product.prouom,
                    prouomname: product.unitofmeasure?.uomname,
                    variants: product.provariants.map(variant => ({
                        pvid: variant.pvid,
                        variantname: variant.pvname,
                        pvcode: variant.pvbarcode
                    }))
                })))
            ]);

            products = {
                rawMaterials,
                finishedGoods,
                semiFinishedGoods
            };
        }

        // Get wastage types from master values
        const wastageTypes = await prisma.mastervalues.findMany({
            where: {
                masterid: 12,
                isdeleted: false
            },
            select: {
                mvid: true,
                mastervalue: true
            }
        });

        // Format the response
        return {
            template: {
                wastageno: "1",
                seriesid: 0,
                proid: null,
                pvid: null,
                wastageqty: 0,
                wastagevalue: 0,
                wastagedate: new Date().toISOString().split('T')[0],
                remarks: "",
                wastagetype: null,
                attachments: [],
                proisfa: proisfa || false
            },
            dropdowns: {
                products: products,
                wastageTypes: wastageTypes.map(type => ({
                    id: type.mvid,
                    value: type.mastervalue
                }))
            }
        };
    } catch (error) {
        logger.error('Error in prowastageService.getWastageModal:', error);
        throw error;
    }
};