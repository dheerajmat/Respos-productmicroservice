import prisma from '../config/prisma.js';
import { ValidationError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import * as productRepository from '../repositories/productRepository.js';
import { Decimal } from '@prisma/client/runtime/library';

export const getProductModal = async (uoid) => {
    try {
        let categories = await prisma.categories.findMany({
            where: {
                isdeleted: false,
            },
            select: {
                catid: true,
                catname: true,
            }
        });

        categories = categories.map(({ catid, catname }) => ({
            id: catid,
            catname
        }));

        const productTypes = await prisma.mastervalues.findMany({
            where: {
                masterid: BigInt(3),
                isdeleted: false
            },
            select: {
                mvid: true,
                mastervalue: true
            }
        });

        const closingStockTypes = await prisma.mastervalues.findMany({
            where: {
                masterid: BigInt(6),
                isdeleted: false,
            },
            select: {
                mvid: true,
                mastervalue: true
            }
        });

        const modalTemplate = {
            proname: "",
            prodescription: "",
            proconfig: 0,
            catids: [],
            prouom: 0,
            productType: 0, // New field for product type
            closingStockCalc: 0, // New field for closing stock calculation
            variant: {
                pvbarcode: "",
                pvpurchaseprice: 0,
                pvsalesprice: 0,
                reconciliation_price: 0,
                normal_loss: 0
            },
            location: {
                safetylevel: 0,
                reorderlevel: 0,
                min_stock_uom: 0,
                par_stock_uom: 0
            },
            tax: {
                taxrate: 0,
                hsncode: ""
            },
            purchaseUoms: [],
            consumptionUom: {
                uomid: 0
            },
            productimgid: null
        };

        return {
            modal: modalTemplate,
            categories: categories,
            uoms: [], // Initially empty, will be populated based on selected category
            productTypes: productTypes.map(pt => ({
                id: pt.mvid,
                value: pt.mastervalue
            })),
            closingStockTypes: closingStockTypes.map(cs => ({
                id: cs.mvid,
                value: cs.mastervalue
            }))
        };
    } catch (error) {
        logger.error('Error in getProductModal:', error);
        throw error;
    }
};

export const createProduct = async (productData, userData) => {
    try {
        const product = await productRepository.createProduct(productData, userData);

        return product;
    } catch (error) {
        logger.error('Error creating product:', error);
        throw error;
    }
};

export const getAllProducts = async (uoid) => {
    try {
        return await prisma.product.findMany({
            where: {
                uoid,
                isdeleted: false
            },
            include: {
                productcategorymapping: {
                    where: {
                        isdeleted: false
                    },
                    include: {
                        categories: true
                    }
                },
                provariants: {
                    where: {
                        isdeleted: false
                    },
                    include: {
                        provariantlocations: true,
                        provarianttax: true
                    }
                }
            }
        });
    } catch (error) {
        logger.error('Error in getAllProducts:', error);
        throw error;
    }
};

export const getProductById = async (proid, uoid) => {
    try {
        const product = await productRepository.getProductById(proid, uoid);
        
        if (!product) {
            throw new ValidationError('Product not found');
        }

        // Format the response based on hasvarient flag
        const formattedProduct = {
            proid: product.proid.toString(),
            proname: product.proname,
            prodescription: product.prodescription,
            proconfig: product.proconfig,
            hasvarient: product.hasvarient,
                
            // Include categories
            categories: product.productcategorymapping.map(mapping => ({
                catid: mapping.catid.toString(),
                catname: mapping.categories.catname
            })),

            // Include UOM
            prouom: product.unitofmeasure?.uomid.toString(),
            uomname: product.unitofmeasure?.uomname,

            // Include product image
            productimgid: product.pvummapping[0]?.productimgid.toString(),
            product_image_url: product.pvummapping[0]?.userimages?.umurl,

            // Include variants based on hasvarient flag
            ...(product.hasvarient
                ? { variants: product.variants }
                : { variant: product.variant }
            )
        };

        return formattedProduct;
    } catch (error) {
        logger.error('Error in getProductById:', error);
        throw error;
    }
};

export const updateProduct = async (productId, productData, userData) => {
    try {
        // Validate input
        if (!productId) {
            throw new ValidationError('Product ID is required');
        }

        if (!productData) {
            throw new ValidationError('Product data is required');
        }

        // Required fields validation
        const requiredFields = ['proname', 'proconfig', 'prouom'];
        for (const field of requiredFields) {
            if (!productData[field]) {
                throw new ValidationError(`${field} is required`);
            }
        }

        // Call repository layer and get transformed data
        const updatedProduct = await productRepository.updateProduct(productId, productData, userData);

        // Return the formatted product using existing helper function
        return {
            proid: updatedProduct.proid.toString(),
            proname: updatedProduct.proname,
            prodescription: updatedProduct.prodescription,
            proconfig: updatedProduct.proconfig,
            hasvarient: updatedProduct.hasvarient,
            categories: updatedProduct.productcategorymapping.map(mapping => ({
                catid: mapping.catid.toString(),
                catname: mapping.categories.catname
            })),
            prouom: updatedProduct.unitofmeasure?.uomid.toString(),
            uomname: updatedProduct.unitofmeasure?.uomname,
            productimgid: updatedProduct.pvummapping[0]?.productimgid.toString(),
            product_image_url: updatedProduct.pvummapping[0]?.userimages?.umurl,
            ...(updatedProduct.hasvarient 
                ? { variants: updatedProduct.variants }
                : { variant: updatedProduct.variant }
            )
        };

    } catch (error) {
        logger.error('Error in updateProduct service:', error);
        throw error;
    }
};

export const deleteProduct = async (proid, uid) => {
    try {
        return await prisma.$transaction(async (prisma) => {
            // Soft delete product
            await prisma.product.update({
                where: { proid },
                data: {
                    isdeleted: true,
                    deletedby: uid,
                    deleteddate: new Date()
                }
            });

            // Soft delete related records
            await Promise.all([
                prisma.productcategorymapping.updateMany({
                    where: { proid },
                    data: {
                        isdeleted: true,
                        deletedby: uid,
                        deleteddate: new Date()
                    }
                }),
                prisma.pvamapping.updateMany({
                    where: { proid },
                    data: {
                        isdeleted: true,
                        deletedby: uid,
                        deleteddate: new Date()
                    }
                }),
                prisma.provariants.updateMany({
                    where: { proid },
                    data: {
                        isdeleted: true,
                        deletedby: uid,
                        deleteddate: new Date()
                    }
                })
            ]);

            return true;
        });
    } catch (error) {
        logger.error('Error in deleteProduct:', error);
        throw error;
    }
};

export const filterProducts = async ({ proname, proconfig, catid, isfa, page = null, limit = null }, uoid) => {
    try {
        // Input validation
        if (!uoid) {
            throw new ValidationError('Organization ID is required');
        }

        // Only validate page and limit if they are provided and not empty strings
        if (page !== null && page !== "" && page < 1) {
            throw new ValidationError('Page number must be greater than 0');
        }

        if (limit !== null && limit !== "" && limit < 1) {
            throw new ValidationError('Limit must be greater than 0');
        }

        // Calculate skip only if both page and limit are provided and not empty
        const skip = (page !== null && page !== "" && limit !== null && limit !== "") 
            ? (page - 1) * limit 
            : undefined;

        // Validate and prepare filters
        const filters = {
            ...(proname !== null && proname?.trim() !== '' && { proname: proname.trim() }),
            ...(proconfig !== null && proconfig !== undefined && { proconfig }),
            ...(catid && { catid }),
            ...(isfa !== undefined && { isfa: Boolean(isfa) })
        };

        // Get products from repository, passing undefined for skip and limit to get all records
        const { products, totalCount } = await productRepository.filterProducts(
            filters, 
            uoid, 
            skip, 
            (limit !== null && limit !== "") ? limit : undefined
        );

        // Helper function to format variant
        const formatVariant = (variant) => {
            if (!variant) return null;
            // console.log("VARIANT: ", variant);
            
            return {
                pvid: variant.pvid?.toString() || '',
                proid: variant.proid?.toString() || '',
                pvname: variant.pvname || null,
                pvdesc: variant.pvdesc || null,
                shortdesc: variant.shortdesc || null,
                pvbarcode: variant.pvbarcode || '',
                pvsku: variant.pvsku || null,
                pvdefaultimgid: variant.pvdefaultimgid || null,
                pvstatus: variant.pvstatus || null,
                pvcurrencyid: variant.pvcurrencyid || null,
                pvsalesprice: variant.pvsalesprice?.toString() || '0',
                pvpurchaseprice: variant.pvpurchaseprice?.toString() || '0',
                pvoldprice: variant.pvoldprice || null,
                pvspecialprice: variant.pvspecialprice || null,
                pvspstartdate: variant.pvspstartdate || null,
                pvspenddate: variant.pvspenddate || null,
                moq: variant.moq || null,
                isinclusive: variant.isinclusive || null,
                uoid: variant.uoid?.toString() || '',
                isdeleted: variant.isdeleted || false,
                createdby: variant.createdby?.toString() || '',
                createddate: variant.createddate || null,
                modifiedby: variant.modifiedby || null,
                modifieddate: variant.modifieddate || null,
                deletedby: variant.deletedby || null,
                deleteddate: variant.deleteddate || null,
                MarkAsNew: variant.MarkAsNew || null,
                MarkAsNewStartDateTimeUtc: variant.MarkAsNewStartDateTimeUtc || null,
                MarkAsNewEndDateTimeUtc: variant.MarkAsNewEndDateTimeUtc || null,
                ispublished: variant.ispublished || null,
                displayOnHomePage: variant.displayOnHomePage || null,
                RequiredProductIds: variant.RequiredProductIds || null,
                admincomment: variant.admincomment || null,
                availabledate: variant.availabledate || null,
                enddate: variant.enddate || null,
                reconciliation_price: variant.reconciliation_price?.toString() || '0',
                normal_loss: variant.normal_loss?.toString() || '0',

                location: variant.provariantlocations?.[0] ? {
                    pvlid: variant.provariantlocations[0].pvlid || null,
                    warhouseid: variant.provariantlocations[0].warhouseid || null,
                    safetylevel: variant.provariantlocations[0].safetylevel || 0,
                    reorderlevel: variant.provariantlocations[0].reorderlevel || 0,
                    min_stock_uom: variant.provariantlocations[0].min_stock_uom?.toString() || '0',
                    min_stock_uom_name: variant.provariantlocations[0].min_stock_uom_name || '',
                    par_stock_uom: variant.provariantlocations[0].par_stock_uom?.toString() || '0',
                    par_stock_uom_name: variant.provariantlocations[0].par_stock_uom_name || '',
                    closingstock_on: variant.provariantlocations[0].closingstock_on || [],
                    openingstock: variant.provariantlocations[0].openingstock || null,
                    closingstock: variant.provariantlocations[0].closingstock || null,
                    autorenew: variant.provariantlocations[0].autorenew || null,
                    isapproved: variant.provariantlocations[0].isapproved || null
                } : null,

                tax: variant.provarianttax?.[0] ? {
                    protaxid: variant.provarianttax[0].protaxid || null,
                    taxrate: variant.provarianttax[0].taxrate || 0,
                    hsncode: variant.provarianttax[0].hsncode || null,
                    isexempt: variant.provarianttax[0].isexempt || false,
                    effectivedate: variant.provarianttax[0].effectivedate || null,
                    isapproved: variant.provarianttax[0].isapproved || null
                } : null,

                purchaseUoms: (variant.uom_mapping || [])
                    .filter(uom => uom?.uom_type?.toString() === '21')
                    .map(uom => ({
                        uommid: uom.uommid || null,
                        proid: uom.proid || null,
                        pvid: uom.pvid || null,
                        uomid: uom.uomid || null,
                        is_default: uom.is_default || false,
                        uom_type: uom.uom_type || null,
                        isdeleted: uom.isdeleted || false,
                        modifiedby: uom.modifiedby || null,
                        modifieddate: uom.modifieddate || null,
                        createdby: uom.createdby || null,
                        uomname: uom.unitofmeasure?.uomname || ''
                    })),

                consumptionUom: variant.uom_mapping?.find(uom => uom?.uom_type?.toString() === '22')
                    ? {
                        uommid: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').uommid || null,
                        proid: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').proid || null,
                        pvid: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').pvid || null,
                        uomid: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').uomid || null,
                        is_default: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').is_default || false,
                        uom_type: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').uom_type || null,
                        isdeleted: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').isdeleted || false,
                        modifiedby: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').modifiedby || null,
                        modifieddate: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').modifieddate || null,
                        createdby: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').createdby || null,
                        uomname: variant.uom_mapping.find(uom => uom?.uom_type?.toString() === '22').unitofmeasure?.uomname || ''
                    }
                    : null,

                pvamappings: (variant.pvamapping || []).map(mapping => ({
                    pvamid: mapping.pvamid || null,
                    attributeid: mapping.attributeid || null,
                    attributeName: mapping.attributes?.attributename || null,
                    attrtextprompt: mapping.attrtextprompt || null,
                    isrequired: mapping.isrequired || false,
                    controltype: mapping.controltype || false,
                    displayorder: mapping.displayorder || 0,
                    pvamvaluemodels: (mapping.pvamvalues || []).map(value => ({
                        pvamvid: value.pvamvid || null,
                        avid: value.attributevalues?.avid || null,
                        attributeValueName: value.attributevalues?.avname || null,
                        avdisplayorder: value.attributevalues?.avdisplayorder || null,
                        avicon: value.attributevalues?.avicon || null,
                        avcolor: value.attributevalues?.avcolor || null,
                        pvamvcolor: value.pvamvcolor || null,
                        umid: value.umid || null,
                        displayorder: value.displayorder || 0
                    }))
                }))
            };
        };

        // Transform products
        const formattedProducts = products.map(product => ({
            proid: product.proid?.toString() || '',
            proname: product.proname || '',
            prodescription: product.prodescription || '',
            proconfig: product.proconfig || 0,
            prouom: product.unitofmeasure?.uomid?.toString() || '',
            prouom_name: product.unitofmeasure?.uomname || '',
            productimgid: product.pvummapping?.[0]?.productimgid?.toString() || '',
            product_image_url: product.pvummapping?.[0]?.userimages?.umurl || '',
            categories: (product.productcategorymapping || []).map(mapping => ({
                catid: mapping.catid || null,
                catdesc: null,
                catname: mapping.categories?.catname || null,
                orderno: null,
                catfullpath: null,
                parentcatid: null,
                categorytype: null
            })),
            hasvarient: product.provariants?.length > 1 || false,
            ...(product.provariants?.length > 1 
                ? { variants: product.provariants.map(formatVariant) }
                : { variant: formatVariant(product.provariants?.[0]) }
            )
        }));

        // Return array with pagination info only if page and limit were provided
        return {
            success: true,
            data: formattedProducts,
            pagination: (page !== null && page !== "" && limit !== null && limit !== "") 
                ? {
                    totalItems: totalCount,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    itemsPerPage: limit
                }
                : {
                    totalItems: totalCount,
                    currentPage: 1,
                    totalPages: 1,
                    itemsPerPage: totalCount
                }
        };
    } catch (error) {
        logger.error('Error in filterProducts:', error);
        throw error;
    }
};

// Variant-related functions
// export const createVariant = async (productId, variantData, userData) => {
//     try {
//         return await prisma.provariants.create({
//             data: {
//                 product: {
//                     connect: {proid: BigInt(productId)}
//                 },
//                 ...variantData,
//                 createdby: userData.uid,
//                 uoid: userData.uoid,
//                 provariantlocations: variantData.location ? {
//                     create: {
//                         ...variantData.location,
//                         createdby: userData.uid,
//                         uoid: userData.uoid
//                     }
//                 } : undefined,
//                 provarianttax: variantData.tax ? {
//                     create: {
//                         ...variantData.tax,
//                         createdby: userData.uid
//                     }
//                 } : undefined
//             },
//             include: {
//                 provariantlocations: true,
//                 provarianttax: true
//             }
//         });
//     } catch (error) {
//         logger.error('Error in createVariant:', error);
//         throw error;
//     }
// };

export const createVariant = async (productId, variantData, userData) => {
    try {
        // Remove these fields from variantData as they'll be handled differently
        const { pvdefaultimgid, pvcurrencyid, location, tax, ...variantFields } = variantData;

        return await prisma.provariants.create({
            data: {
                product: {
                    connect: { proid: BigInt(productId) }
                },
                ...variantFields,  // Spread the basic variant fields
                users_provariants_createdbyTousers: {
                    connect: { uid: BigInt(userData.uid) }
                },
                userorganization: {
                    connect: { uoid: BigInt(userData.uoid) }
                },
                isdeleted: false,
                // Handle image relationship if provided
                pvummapping: pvdefaultimgid ? {
                    create: {
                        userimages: {
                            connect: { umid: BigInt(pvdefaultimgid) }
                        },
                        createdby: BigInt(userData.uid),
                        isdeleted: false,
                        product: {
                            connect: { proid: BigInt(productId) }
                        }
                    }
                } : undefined,
                // Handle currency relationship if provided
                currencies: pvcurrencyid ? {
                    connect: { currid: BigInt(pvcurrencyid) }
                } : undefined,
                // Handle location creation if provided
                provariantlocations: location ? {
                    create: {
                        safetylevel: location.safetylevel,
                        reorderlevel: location.reorderlevel,
                        min_stock_uom: BigInt(location.min_stock_uom),
                        par_stock_uom: BigInt(location.par_stock_uom),
                        createdby: BigInt(userData.uid),
                        uoid: BigInt(userData.uoid),
                        isdeleted: false
                    }
                } : undefined,
                // Handle tax creation if provided
                provarianttax: tax ? {
                    create: {
                        taxrate: tax.taxrate,
                        hsncode: tax.hsncode,
                        createdby: BigInt(userData.uid),
                        isdeleted: false
                    }
                } : undefined
            },
            include: {
                provariantlocations: true,
                provarianttax: true,
                pvummapping: {
                    include: {
                        userimages: true
                    }
                },
                // currencies: true
            }
        });
    } catch (error) {
        logger.error('Error in createVariant:', error);
        throw error;
    }
};


export const getVariants = async (productId) => {
    try {
        return await prisma.provariants.findMany({
            where: {
                proid: productId,
                isdeleted: false
            },
            include: {
                provariantlocations: true,
                provarianttax: true
            }
        });
    } catch (error) {
        logger.error('Error in getVariants:', error);
        throw error;
    }
};

export const getVariantById = async (productId, variantId) => {
    try {
        return await prisma.provariants.findFirst({
            where: {
                proid: productId,
                pvid: variantId,
                isdeleted: false
            },
            include: {
                provariantlocations: true,
                provarianttax: true
            }
        });
    } catch (error) {
        logger.error('Error in getVariantById:', error);
        throw error;
    }
};

export const updateVariant = async (productId, variantId, variantData, userData) => {
    try {
        const { provariantlocations, provarianttax, ...variantFields } = variantData;

        return await prisma.$transaction(async (prisma) => {
            // Update the main variant
            const variant = await prisma.provariants.update({
                where: {
                    pvid: BigInt(variantId),
                    proid: BigInt(productId)
                },
                data: {
                    ...variantFields,
                    modifiedby: BigInt(userData.uid),
                    modifieddate: new Date(),
                    // Handle currency relationship if provided
                    currencies: variantFields.pvcurrencyid ? {
                        connect: { currid: BigInt(variantFields.pvcurrencyid) }
                    } : undefined
                }
            });

            // Update location if provided
            if (provariantlocations?.[0]) {
                await prisma.provariantlocations.update({
                    where: {
                        pvlid: BigInt(provariantlocations[0].pvlid)
                    },
                    data: {
                        proid: BigInt(productId),
                        pvid: BigInt(variantId),
                        safetylevel: Number(provariantlocations[0].safetylevel),
                        reorderlevel: Number(provariantlocations[0].reorderlevel),
                        min_stock_uom: BigInt(provariantlocations[0].min_stock_uom),
                        par_stock_uom: BigInt(provariantlocations[0].par_stock_uom),
                        modifiedby: BigInt(userData.uid),
                        modifieddate: new Date()
                    }
                });
            }

            // Update tax if provided
            if (provarianttax?.[0]) {
                await prisma.provarianttax.update({
                    where: {
                        protaxid: BigInt(provarianttax[0].protaxid)
                    },
                    data: {
                        proid: BigInt(productId),
                        pvid: BigInt(variantId),
                        taxrate: Number(provarianttax[0].taxrate),
                        hsncode: Number(provarianttax[0]?.hsncode),
                        modifiedby: BigInt(userData.uid),
                        modifieddate: new Date()
                    }
                });
            }

            // Return the updated variant with all its relations
            return await prisma.provariants.findFirst({
                where: {
                    pvid: BigInt(variantId),
                    proid: BigInt(productId)
                },
                include: {
                    provariantlocations: true,
                    provarianttax: true,
                    currencies: true
                }
            });
        });
    } catch (error) {
        logger.error('Error in updateVariant:', error);
        throw error;
    }
};

export const deleteVariant = async (productId, variantId, uid) => {
    try {
        return await prisma.$transaction(async (prisma) => {
            await Promise.all([
                prisma.provariants.update({
                    where: {
                        pvid: variantId,
                        proid: productId
                    },
                    data: {
                        isdeleted: true,
                        deletedby: uid,
                        deleteddate: new Date()
                    }
                }),
                prisma.provariantlocations.updateMany({
                    where: { pvid: variantId },
                    data: {
                        isdeleted: true,
                        deletedby: uid,
                        deleteddate: new Date()
                    }
                }),
                prisma.provarianttax.updateMany({
                    where: { pvid: variantId },
                    data: {
                        isdeleted: true,
                        deletedby: uid,
                        deleteddate: new Date()
                    }
                })
            ]);

            return true;
        });
    } catch (error) {
        logger.error('Error in deleteVariant:', error);
        throw error;
    }
};


export const formatProductForUI = (product) => {
    if (!product) return null;

    return {
        success: true,
        data: {
            proid: product.proid.toString(),
            proname: product.proname,
            prodescription: product.prodescription,
            proconfig: product.proconfig,
            catid: product.catid,
            prouom: product.prouom?.toString(),
            prouom_name: product.uom_mapping?.find(u => u.uomid === product.prouom)?.unitofmeasure?.uomname,
            productimgid: product.provariants?.[0]?.pvummapping?.[0]?.productimgid?.toString(),
            product_image_url: product.provariants?.[0]?.pvummapping?.[0]?.userimages?.umurl,

            categories: product.productcategorymapping?.map(pcm => ({
                catid: pcm.categories.catid,
                catdesc: pcm.categories.catdesc,
                catname: pcm.categories.catname,
                orderno: pcm.categories.orderno,
                catfullpath: pcm.categories.catfullpath,
                parentcatid: pcm.categories.parentcatid,
                categorytype: pcm.categories.categorytype
            })),

            variant: product.provariants?.[0] ? {
                pvid: product.provariants[0].pvid.toString(),
                pvbarcode: product.provariants[0].pvbarcode,
                pvpurchaseprice: product.provariants[0].pvpurchaseprice.toString(),
                pvsalesprice: product.provariants[0].pvsalesprice.toString(),
                reconciliation_price: product.provariants[0].reconciliation_price?.toString(),
                normal_loss: product.provariants[0].normal_loss?.toString()
            } : null,

            location: product.provariants?.[0]?.provariantlocations?.[0] ? {
                safetylevel: product.provariants[0].provariantlocations[0].safetylevel.toString(),
                reorderlevel: product.provariants[0].provariantlocations[0].reorderlevel.toString(),
                min_stock_uom: product.provariants[0].provariantlocations[0].min_stock_uom.toString(),
                min_stock_uom_name: product.uom_mapping?.find(u => u.uomid === product.provariants[0].provariantlocations[0].min_stock_uom)?.unitofmeasure?.uomname,
                par_stock_uom: product.provariants[0].provariantlocations[0].par_stock_uom.toString(),
                par_stock_uom_name: product.uom_mapping?.find(u => u.uomid === product.provariants[0].provariantlocations[0].par_stock_uom)?.unitofmeasure?.uomname,
                closingstock_on: product.provariants[0].provariantlocations[0].closingstock_on
            } : null,

            tax: product.provariants?.[0]?.provarianttax?.[0] ? {
                taxrate: product.provariants[0].provarianttax[0].taxrate.toString(),
                hsncode: product.provariants[0].provarianttax[0].hsncode
            } : null,

            purchaseUoms: product.uom_mapping
                ?.filter(uom => uom.uom_type.toString() === '18')
                ?.map(uom => ({
                    uommid: uom.uommid.toString(),
                    proid: uom.proid.toString(),
                    pvid: uom.pvid?.toString(),
                    uomid: uom.uomid.toString(),
                    is_default: uom.is_default,
                    uom_type: uom.uom_type.toString(),
                    isdeleted: uom.isdeleted,
                    modifiedby: uom.modifiedby?.toString(),
                    modifieddate: uom.modifieddate,
                    createdby: uom.createdby?.toString(),
                    uomname: uom.unitofmeasure?.uomname
                })) || [],

            consumptionUom: product.uom_mapping
                ?.find(uom => uom.uom_type.toString() === '19')
                ? {
                    uommid: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').uommid.toString(),
                    proid: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').proid.toString(),
                    pvid: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').pvid?.toString(),
                    uomid: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').uomid.toString(),
                    is_default: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').is_default,
                    uom_type: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').uom_type.toString(),
                    isdeleted: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').isdeleted,
                    modifiedby: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').modifiedby?.toString(),
                    modifieddate: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').modifieddate,
                    createdby: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').createdby?.toString(),
                    uomname: product.uom_mapping.find(uom => uom.uom_type.toString() === '19').unitofmeasure?.uomname
                }
                : null,

            pvamappings: product.pvamapping?.map(mapping => ({
                pvamid: mapping.pvamid.toString(),
                attributeid: mapping.attributeid.toString(),
                attributename: mapping.attributes?.attributename,
                attrtextprompt: mapping.attrtextprompt,
                isrequired: mapping.isrequired,
                controltype: mapping.controltype,
                displayorder: mapping.displayorder,
                pvamvaluemodels: mapping.pvamvalues?.map(value => ({
                    pvamvid: value.pvamvid.toString(),
                    avid: value.attributevalues?.avid.toString(),
                    avname: value.attributevalues?.avname,
                    pvamvcolor: value.pvamvcolor,
                    umid: value.umid?.toString(),
                    displayorder: value.displayorder
                }))
            })) || []
        }
    };
};

export const createFixedAsset = async (fixedAssetData, userData) => {
    try {
        // Validate required fields
        const requiredFields = ['proname', 'catids', 'prodescription', 'location'];
        for (const field of requiredFields) {
            if (!fixedAssetData[field]) {
                throw new ValidationError(`${field} is required`);
            }
        }

        // Prepare product data with fixed asset specific defaults
        const productData = {
            proname: fixedAssetData.proname,
            prodescription: fixedAssetData.prodescription,
            catids: fixedAssetData.catids,
            proconfig: 1, // Default config
            proisfa: true, // Mark as fixed asset
            prouom: 1, // Default UOM
            hasvarient: false, // Fixed assets always have single variant
            variant: {
                pvname: fixedAssetData.proname, // Same as product name
                pvdesc: fixedAssetData.prodescription, // Same as product description
                pvbarcode: '', // Empty barcode
                pvpurchaseprice: 0,
                pvsalesprice: 0,
                reconciliation_price: 0,
                normal_loss: 0,
                location: {
                    openingstock: fixedAssetData.location.openingstock || 0,
                    reorderlevel: fixedAssetData.location.reorderlevel || 0
                },
                tax: {
                    taxrate: 0,
                    hsncode: null
                },
                purchaseUoms: [], // Empty purchase UOMs
                consumptionUom: {
                    uomid: 1 // Default UOM
                }
            }
        };

        // Create the fixed asset using existing product creation logic
        const product = await productRepository.createProduct(productData, userData);

        return product;
    } catch (error) {
        logger.error('Error in createFixedAsset:', error);
        throw error;
    }
};

export const getFixedAssetById = async (productId, uoid) => {
    try {
        const product = await prisma.product.findFirst({
            where: {
                proid: BigInt(productId),
                uoid: BigInt(uoid),
                proisfa: true,
                isdeleted: false
            },
            include: {
                productcategorymapping: {
                    where: { isdeleted: false },
                    include: {
                        categories: true
                    }
                },
                provariants: {
                    where: { isdeleted: false },
                    include: {
                        provariantlocations: {
                            where: { isdeleted: false }
                        }
                    }
                }
            }
        });

        if (!product) {
            throw new ValidationError('Fixed asset not found');
        }

        // Format the response
        return {
            proid: product.proid.toString(),
            proname: product.proname,
            prodescription: product.prodescription,
            categories: product.productcategorymapping.map(pcm => ({
                catid: pcm.catid.toString(),
                catname: pcm.categories.catname
            })),
            location: product.provariants[0]?.provariantlocations[0] ? {
                openingstock: product.provariants[0].provariantlocations[0].openingstock?.toString(),
                reorderlevel: product.provariants[0].provariantlocations[0].reorderlevel?.toString(),
                min_stock_uom: product.provariants[0].provariantlocations[0].min_stock_uom?.toString(),
                par_stock_uom: product.provariants[0].provariantlocations[0].par_stock_uom?.toString()
            } : null
        };
    } catch (error) {
        logger.error('Error in getFixedAssetById:', error);
        throw error;
    }
};

export const updateFixedAsset = async (productId, fixedAssetData, userData) => {
    try {
        // Validate input
        if (!productId) {
            throw new ValidationError('Product ID is required');
        }

        // Check if product exists and is a fixed asset
        const existingProduct = await prisma.product.findFirst({
            where: {
                proid: BigInt(productId),
                proisfa: true,
                isdeleted: false
            }
        });

        if (!existingProduct) {
            throw new ValidationError('Fixed asset not found');
        }

        return await prisma.$transaction(async (prisma) => {
            // Update base product
            const product = await prisma.product.update({
                where: { proid: BigInt(productId) },
                data: {
                    proname: fixedAssetData.proname,
                    prodescription: fixedAssetData.prodescription,
                    modifiedby: BigInt(userData.uid),
                    modifieddate: new Date()
                }
            });

            // Update category mappings if provided
            if (fixedAssetData.catids?.length) {
                // Delete existing mappings
                await prisma.productcategorymapping.deleteMany({
                    where: { proid: BigInt(productId) }
                });

                // Create new mappings
                await prisma.productcategorymapping.createMany({
                    data: fixedAssetData.catids.map(catid => ({
                        proid: BigInt(productId),
                        catid: BigInt(catid),
                        createdby: BigInt(userData.uid),
                        isdeleted: false
                    }))
                });
            }

            // Update variant location if provided
            if (fixedAssetData.location) {
                const variant = await prisma.provariants.findFirst({
                    where: { proid: BigInt(productId), isdeleted: false }
                });

                if (variant) {
                    await prisma.provariantlocations.updateMany({
                        where: { 
                            pvid: variant.pvid,
                            isdeleted: false 
                        },
                        data: {
                            openingstock: new Decimal(fixedAssetData.location.openingstock || 0),
                            reorderlevel: new Decimal(fixedAssetData.location.reorderlevel || 0),
                            // min_stock_uom: BigInt(fixedAssetData.location.min_stock_uom),
                            // par_stock_uom: BigInt(fixedAssetData.location.par_stock_uom),
                            modifiedby: BigInt(userData.uid),
                            modifieddate: new Date()
                        }
                    });
                }
            }

            // Return updated fixed asset
            return await getFixedAssetById(productId, userData.uoid);
        });
    } catch (error) {
        logger.error('Error in updateFixedAsset:', error);
        throw error;
    }
};

export const getFixedAssetModal = async (uoid) => {
    try {
        // Get only active categories
        let categories = await prisma.categories.findMany({
            where: {
                isdeleted: false,
            },
            select: {
                catid: true,
                catname: true,
            }
        });

        // Format categories
        // categories = categories.map(({ catid, catname }) => ({
        //     catid: catid,
        //     catname
        // }));

        // Create modal template specific to fixed assets
        const modalTemplate = {
            proname: "",
            prodescription: "",
            catids: [],
            location: {
                openingstock: 0,
                reorderlevel: 0
            }
        };

        return {
            modal: modalTemplate,
            categories: categories
        };
    } catch (error) {
        logger.error('Error in getFixedAssetModal:', error);
        throw error;
    }
};