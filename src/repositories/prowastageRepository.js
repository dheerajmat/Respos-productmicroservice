import prisma from '../config/prisma.js';
import { ValidationError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const createWastage = async (wastageData, attachments = []) => {
    try {
        return await prisma.$transaction(async (prisma) => {
            // Create base wastage record
            const wastage = await prisma.prowastage.create({
                data: {
                    wastageno: wastageData.wastageno ? parseInt(wastageData.wastageno) : null,
                    seriesid: wastageData.seriesid ? BigInt(wastageData.seriesid) : null,
                    proid: BigInt(wastageData.proid),
                    pvid: wastageData.pvid ? BigInt(wastageData.pvid) : null,
                    proisfa: wastageData.proisfa, 
                    wastageqty: wastageData.wastageqty,
                    
                    wastagevalue: wastageData.wastagevalue,
                    wastagedate: new Date(wastageData.wastagedate),
                    dom: wastageData.dom ? new Date(wastageData.dom) : null,
                    doe: wastageData.doe ? new Date(wastageData.doe) : null,
                    bcode: wastageData.bcode,
                    fcode: wastageData.fcode,
                    remarks: wastageData.remarks,
                    uomid: wastageData.uomid ? BigInt(wastageData.uomid) : null,
                    uoid: wastageData.uoid ? BigInt(wastageData.uoid) : null,
                    uaid: wastageData.uaid ? BigInt(wastageData.uaid) : null,
                    createdby: BigInt(wastageData.createdby),
                    wastagetype: wastageData.wastagetype ? BigInt(wastageData.wastagetype) : null,
                    isdeleted: false
                }
            });

            // Create attachments if any
            if (attachments.length > 0) {
                await prisma.prowastageattachment.createMany({
                    data: attachments.map(umid => ({
                        wastageid: wastage.wastageid,
                        umid: umid ? BigInt(umid) : null
                    }))
                });
            }

            return wastage;
        });
    } catch (error) {
        logger.error('Error in createWastage:', error);
        throw error;
    }
};

export const getWastageById = async (wastageid) => {
    try {
        const wastage = await prisma.prowastage.findFirst({
            where: {
                wastageid: BigInt(wastageid),
                isdeleted: false
            },
            include: {
                prowastageattachment: {
                    include: {
                        userimages: true
                    }
                },
                product: {
                    select: {
                        proname: true,
                        proconfig: true,
                        unitofmeasure: {
                            select: {
                                uomname: true
                            }
                        }
                    }
                },
                mastervalues: {
                    select: {
                        mastervalue: true
                    }
                },
                provariants: {
                    select: {
                        pvname: true
                    }
                }
            }
        });

        if (wastage) {
            return {
                ...wastage,
                proname: wastage.product?.proname,
                proconfig: wastage.product?.proconfig,
                pvname: wastage.provariants?.pvname,
                wastagetypename: wastage.mastervalues?.mastervalue
            };
        }

        return null;
    } catch (error) {
        logger.error('Error in getWastageById:', error);
        throw error;
    }
};

export const updateWastage = async (wastageid, updateData) => {
    try {
        return await prisma.prowastage.update({
            where: {
                wastageid: BigInt(wastageid),
                isdeleted: false
            },
            data: {
                proid: updateData.proid ? BigInt(updateData.proid) : undefined,
                pvid: updateData.pvid ? BigInt(updateData.pvid) : undefined,
                wastageqty: updateData.wastageqty,
                wastagevalue: updateData.wastagevalue,
                wastagedate: updateData.wastagedate ? new Date(updateData.wastagedate) : undefined,
                remarks: updateData.remarks,
                modifiedby: BigInt(updateData.modifiedby),
                modifieddate: new Date(),
                wastagetype: updateData.wastagetype ? BigInt(updateData.wastagetype) : undefined
            },
            include: {
                product: {
                    select: {
                        proname: true,
                        unitofmeasure: {
                            select: {
                                uomname: true
                            }
                        }
                    }
                },
                mastervalues: {
                    select: {
                        mastervalue: true
                    }
                }
            }
        });
    } catch (error) {
        logger.error('Error in updateWastage:', error);
        throw error;
    }
};

export const deleteWastage = async (wastageid, deletedby) => {
    try {
        return await prisma.prowastage.update({
            where: {
                wastageid: BigInt(wastageid),
                isdeleted: false
            },
            data: {
                isdeleted: true,
                deletedby: BigInt(deletedby),
                deleteddate: new Date()
            }
        });
    } catch (error) {
        logger.error('Error in deleteWastage:', error);
        throw error;
    }
};

export const listWastages = async (filters) => {
    try {
        const {
            page = 1,
            limit = 10,
            proisfa,
            ...otherFilters
        } = filters;

        const skip = (page - 1) * limit;

        // Build where clause
        const where = {
            isdeleted: false,
            ...otherFilters
        };

        // Add proisfa condition only if it's not undefined
        if (proisfa !== undefined) {
            where.proisfa = proisfa;
        }

        // Get total count
        const totalItems = await prisma.prowastage.count({
            where
        });

        // Get paginated data
        const wastages = await prisma.prowastage.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                wastageid: 'desc'
            },
            include: {
                product: {
                    select: {
                        proname: true,
                    }
                },
                provariants: {
                    select: {
                        pvname: true
                    }
                },
                unitofmeasure: {
                    select: {
                        uomname: true
                    }
                },
                mastervalues: {
                    select: {
                        mastervalue: true
                    }
                }
            }
        });

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: wastages.map(wastage => ({
                ...wastage,
                productname: wastage.product?.proname,
                variantname: wastage.provariant?.pvname,
                uomname: wastage.unitofmeasure?.uomname,
                wastagetypename: wastage.mastervalues?.mastervalue
            })),
            pagination: {
                totalItems,
                currentPage: page,
                totalPages,
                itemsPerPage: limit
            }
        };
    } catch (error) {
        logger.error('Error in prowastageRepository.listWastages:', error);
        throw error;
    }
}; 