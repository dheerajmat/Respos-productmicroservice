import prisma from '../config/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';

export const createProduct = async (productData, userData) => {
    return await prisma.$transaction(async (prisma) => {
        // Create base product
        const product = await prisma.product.create({
            data: {
                proname: productData.proname,
                prodescription: productData.prodescription,
                proconfig: productData.proconfig,
                proisfa: productData.proisfa || false,
                hasvarient: productData?.variants?.length > 1 || false,
                unitofmeasure: {
                    connect: { uomid: BigInt(productData.prouom) }
                },
                // userimages: productData.productimgid ? {
                //     connect: { umid: BigInt(productData.productimgid) }
                // } : undefined,
                userorganization: {
                    connect: { uoid: BigInt(userData.uoid) }
                },
                users_product_createdbyTousers: {
                    connect: { uid: BigInt(userData.uid) }
                },
                isdeleted: false
            },
            select: {
                proid: true,
                proname: true,
                proconfig: true,
                prodescription: true,
                shortdescription: true,
                protype: true,
                proisactive: true,
                prouom: true,
                proisfa: true,
                proorigin: true,
                prodisplayinweb: true,
                expiryfrom: true,
                ispurchasable: true,
                uoid: true,
                price: true,
                hasvarient: true,
                createdby: true,
                createddate: true,
            }
        });

        // Create pvummapping for product image if provided
        if (productData.productimgid) {
            await prisma.pvummapping.create({
                data: {
                    proid: product.proid,
                    productimgid: BigInt(productData.productimgid),
                    createdby: BigInt(userData.uid),
                    isdeleted: false
                }
            });
        }

        // Create category mappings
        if (productData.catids?.length) {
            await prisma.productcategorymapping.createMany({
                data: productData.catids.map(catid => ({
                    proid: product.proid,
                    catid: BigInt(catid),
                    createdby: BigInt(userData.uid),
                    isdeleted: false
                }))
            });
        }

        // Handle variants based on hasvarient flag
        if (productData.hasvarient) {
            // Create multiple variants
            for (const variantData of productData.variants) {
                // Create variant
                const variant = await prisma.provariants.create({
                    data: {
                        proid: product.proid,
                        pvname: variantData.pvname || '',
                        pvdesc: variantData.pvdesc || '',
                        pvbarcode: variantData.pvbarcode || null,
                        pvpurchaseprice: new Decimal(variantData.pvpurchaseprice || 0),
                        pvsalesprice: new Decimal(variantData.pvsalesprice || 0),
                        reconciliation_price: new Decimal(variantData.reconciliation_price || 0),
                        normal_loss: new Decimal(variantData.normal_loss || 0),
                        createdby: BigInt(userData.uid),
                        uoid: BigInt(userData.uoid),
                        isdeleted: false
                    }
                });

                // Create variant location
                if (variantData.location) {
                    await prisma.provariantlocations.create({
                        data: {
                            proid: product.proid,
                            pvid: variant.pvid,
                            safetylevel: new Decimal(variantData.location.safetylevel || 0),
                            reorderlevel: new Decimal(variantData.location.reorderlevel || 0),
                            min_stock_uom: BigInt(variantData.location.min_stock_uom),
                            par_stock_uom: BigInt(variantData.location.par_stock_uom),
                            closingstock_on: Array.isArray(variantData.location.closingstock_on) 
                                ? variantData.location.closingstock_on.map(Number) 
                                : [],
                            openingstock: new Decimal(variantData.location.openingstock || 0),
                            closingstock: new Decimal(variantData.location.closingstock || 0),
                            autorenew: variantData.location.autorenew,
                            createdby: BigInt(userData.uid),
                            uoid: BigInt(userData.uoid),
                            isdeleted: false
                        }
                    });
                }

                // Create variant tax
                if (variantData.tax) {
                    await prisma.provarianttax.create({
                        data: {
                            proid: product.proid,
                            pvid: variant.pvid,
                            taxrate: new Decimal(variantData.tax.taxrate || 0),
                            hsncode: variantData.tax.hsncode,
                            createdby: BigInt(userData.uid),
                            isdeleted: false
                        }
                    });
                }

                // Create UOM mappings
                const uomMappings = [];
                if (variantData.purchaseUoms?.length) {
                    const purchaseUomMappings = variantData.purchaseUoms.map(uom => ({
                        proid: product.proid,
                        pvid: variant.pvid,
                        uomid: BigInt(uom.uomid),
                        is_default: uom.is_default || false,
                        uom_type: BigInt(21), // Purchase UOM type
                        createdby: BigInt(userData.uid),
                        isdeleted: false
                    }));
                    uomMappings.push(...purchaseUomMappings);
                }

                if (variantData.consumptionUom) {
                    uomMappings.push({
                        proid: product.proid,
                        pvid: variant.pvid,
                        uomid: BigInt(variantData.consumptionUom.uomid),
                        is_default: true,
                        uom_type: BigInt(22), // Consumption UOM type
                        createdby: BigInt(userData.uid),
                        isdeleted: false
                    });
                }

                if (uomMappings.length) {
                    await prisma.uom_mapping.createMany({ data: uomMappings });
                }

                // Create attribute mappings
                if (variantData.pvamappings?.length) {
                    for (const mapping of variantData.pvamappings) {
                        const pvamapping = await prisma.pvamapping.create({
                            data: {
                                proid: product.proid,
                                pvid: variant.pvid,
                                attributeid: BigInt(mapping.attributeid),
                                attrtextprompt: mapping.attrtextprompt,
                                isrequired: mapping.isrequired,
                                controltype: mapping.controltype,
                                displayorder: mapping.displayorder,
                                createdby: BigInt(userData.uid),
                                isdeleted: false
                            }
                        });

                        if (mapping.pvamvaluemodels?.length) {
                            await prisma.pvamvalues.createMany({
                                data: mapping.pvamvaluemodels.map(value => ({
                                    pvamid: pvamapping.pvamid,
                                    avid: BigInt(value.avid),
                                    pvamvcolor: value.pvamvcolor,
                                    umid: value.umid ? BigInt(value.umid) : null,
                                    displayorder: value.displayorder,
                                    createdby: BigInt(userData.uid),
                                    isdeleted: false
                                }))
                            });
                        }
                    }
                }
            }
        } else {
            // Create single variant
            const variantData = productData.variant;
            const variant = await prisma.provariants.create({
                data: {
                    proid: product.proid,
                    pvname: variantData.pvname || '',
                    pvdesc: variantData.pvdesc || '',
                    pvbarcode: variantData.pvbarcode || null,
                    pvpurchaseprice: new Decimal(variantData.pvpurchaseprice || 0),
                    pvsalesprice: new Decimal(variantData.pvsalesprice || 0),
                    reconciliation_price: new Decimal(variantData.reconciliation_price || 0),
                    normal_loss: new Decimal(variantData.normal_loss || 0),
                    createdby: BigInt(userData.uid),
                    uoid: BigInt(userData.uoid),
                    isdeleted: false
                }
            });

            // Create variant location
            if (variantData.location) {
                await prisma.provariantlocations.create({
                    data: {
                        proid: product.proid,
                        pvid: variant.pvid,
                        safetylevel: new Decimal(variantData.location.safetylevel || 0),
                        reorderlevel: new Decimal(variantData.location.reorderlevel || 0),
                        min_stock_uom: variantData.location.min_stock_uom ? BigInt(variantData.location.min_stock_uom) : null,
                        par_stock_uom: variantData.location.par_stock_uom ? BigInt(variantData.location.par_stock_uom) : null,
                        openingstock: new Decimal(variantData.location.openingstock || 0),
                        closingstock: new Decimal(variantData.location.closingstock || 0),
                        closingstock_on: Array.isArray(variantData.location.closingstock_on) 
                            ? variantData.location.closingstock_on.map(Number) 
                            : [],
                        createdby: BigInt(userData.uid),
                        uoid: BigInt(userData.uoid),
                        isdeleted: false
                    }
                });
            }

            // Create variant tax
            if (variantData.tax) {
                await prisma.provarianttax.create({
                    data: {
                        proid: product.proid,
                        pvid: variant.pvid,
                        taxrate: new Decimal(variantData.tax.taxrate || 0),
                        hsncode: variantData.tax.hsncode,
                        createdby: BigInt(userData.uid),
                        isdeleted: false
                    }
                });
            }

            // Create UOM mappings
            const uomMappings = [];
            if (variantData.purchaseUoms?.length) {
                const purchaseUomMappings = variantData.purchaseUoms.map(uom => ({
                    proid: product.proid,
                    pvid: variant.pvid,
                    uomid: BigInt(uom.uomid),
                    is_default: uom.is_default || false,
                    uom_type: BigInt(21), // Purchase UOM type
                    createdby: BigInt(userData.uid),
                    isdeleted: false
                }));
                uomMappings.push(...purchaseUomMappings);
            }

            if (variantData.consumptionUom) {
                uomMappings.push({
                    proid: product.proid,
                    pvid: variant.pvid,
                    uomid: BigInt(variantData.consumptionUom.uomid),
                    is_default: true,
                    uom_type: BigInt(22), // Consumption UOM type
                    createdby: BigInt(userData.uid),
                    isdeleted: false
                });
            }

            if (uomMappings.length) {
                await prisma.uom_mapping.createMany({ data: uomMappings });
            }

            // Create attribute mappings
            if (variantData.pvamappings?.length) {
                for (const mapping of variantData.pvamappings) {
                    const pvamapping = await prisma.pvamapping.create({
                        data: {
                            proid: product.proid,
                            pvid: variant.pvid,
                            attributeid: BigInt(mapping.attributeid),
                            attrtextprompt: mapping.attrtextprompt,
                            isrequired: mapping.isrequired,
                            controltype: mapping.controltype,
                            displayorder: mapping.displayorder,
                            createdby: BigInt(userData.uid),
                            isdeleted: false
                        }
                    });

                    if (mapping.pvamvaluemodels?.length) {
                        await prisma.pvamvalues.createMany({
                            data: mapping.pvamvaluemodels.map(value => ({
                                pvamid: pvamapping.pvamid,
                                avid: BigInt(value.avid),
                                pvamvcolor: value.pvamvcolor,
                                umid: value.umid ? BigInt(value.umid) : null,
                                displayorder: value.displayorder,
                                createdby: BigInt(userData.uid),
                                isdeleted: false
                            }))
                        });
                    }
                }
            }
        }

        return product;
    });
};

export const getProductById = async (productId, uoid) => {
    const product = await prisma.product.findFirst({
        where: {
            proid: BigInt(productId),
            uoid: BigInt(uoid),
            isdeleted: false
        },
        include: {
            productcategorymapping: {
                where: { isdeleted: false },
                include: {
                    categories: true
                },
                orderBy: {
                    id: 'asc'
                }
            },
            provariants: {
                where: { isdeleted: false },
                include: {
                    provariantlocations: {
                        where: { isdeleted: false },
                        include: {
                            unitofmeasure_provariantlocations_min_stock_uomTounitofmeasure: true,
                            unitofmeasure_provariantlocations_par_stock_uomTounitofmeasure: true
                        }
                    },
                    provarianttax: {
                        where: { isdeleted: false }
                    },
                    uom_mapping: {
                        where: { 
                            isdeleted: false,
                            OR: [
                                { uom_type: BigInt(21) },  // Purchase UOM type
                                { uom_type: BigInt(22) }   // Consumption UOM type
                            ]
                        },
                        include: {
                            unitofmeasure: true
                        }
                    },
                    pvamapping: {
                        where: { isdeleted: false },
                        include: {
                            attributes: true,
                            pvamvalues: {
                                where: { isdeleted: false },
                                include: {
                                    attributevalues: true,
                                    userimages: true
                                }
                            }
                        }
                    }
                }
            },
            pvummapping: {
                where: { isdeleted: false },
                include: {
                    userimages: true
                }
            },
            unitofmeasure: true
        }
    });

    if (!product) return null;

    // console.log("PRODUCT variant loca",product.provariants[0].provariantlocations);

    // Determine if product has multiple variants
    const hasVariants = product.provariants.length > 1;

    // Transform the data based on hasVariants flag
    const transformedProduct = {
        ...product,
        hasvarient: hasVariants,
        // If hasVariants is true, return array of variants, else return single variant object
        ...(hasVariants 
            ? { variants: product.provariants.map(transformVariant) }
            : { variant: transformVariant(product.provariants[0]) }
        )
    };

    // Remove the original provariants array
    delete transformedProduct.provariants;

    return transformedProduct;
};

export const getAllProducts = async (uoid, filters = {}) => {
    const where = {
        uoid: BigInt(uoid),
        isdeleted: false,
        ...(filters.search && {
            OR: [
                { proname: { contains: filters.search, mode: 'insensitive' } },
                { prodescription: { contains: filters.search, mode: 'insensitive' } }
            ]
        }),
        ...(filters.categoryId && {
            productcategorymapping: {
                some: {
                    catid: BigInt(filters.categoryId),
                    isdeleted: false
                }
            }
        })
    };

    const products = await prisma.product.findMany({
        where,
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
                    },
                    provarianttax: {
                        where: { isdeleted: false }
                    },
                    uom_mapping: {
                        where: { isdeleted: false },
                        include: {
                            unitofmeasure: true
                        }
                    }
                }
            },
            uom_mapping: {
                where: { isdeleted: false },
                include: {
                    unitofmeasure: true
                }
            }
        },
        orderBy: {
            createddate: 'desc'
        },
        ...(filters.limit && { take: parseInt(filters.limit) }),
        ...(filters.offset && { skip: parseInt(filters.offset) })
    });

    const total = await prisma.product.count({ where });

    return {
        products,
        total,
        page: filters.offset ? Math.floor(parseInt(filters.offset) / parseInt(filters.limit)) + 1 : 1,
        pageSize: filters.limit ? parseInt(filters.limit) : total
    };
};

export const updateProduct = async (productId, productData, userData) => {
    return await prisma.$transaction(async (prisma) => {
        // 1. Update base product
        const updatedProduct = await prisma.product.update({
            where: { proid: BigInt(productId) },
            data: {
                proname: productData.proname,
                prodescription: productData.prodescription,
                proconfig: productData.proconfig,
                hasvarient: productData?.variants?.length > 1 || false,
                unitofmeasure: {
                    connect: { uomid: BigInt(productData.prouom) }
                },
                userorganization: {
                    connect: { uoid: BigInt(userData.uoid) }
                },
                users_product_modifiedbyTousers: {
                    connect: { uid: BigInt(userData.uid) }
                },
                modifieddate: new Date()
            }
        });

        // 2. Update product image mapping
        await prisma.pvummapping.deleteMany({
            where: { proid: BigInt(productId) }
        });

        if (productData.productimgid) {
            await prisma.pvummapping.create({
                data: {
                    proid: BigInt(productId),
                    productimgid: BigInt(productData.productimgid),
                    createdby: BigInt(userData.uid),
                    isdeleted: false
                }
            });
        }

        // 3. Update category mappings
        await prisma.productcategorymapping.deleteMany({
            where: { proid: BigInt(productId) }
        });

        if (productData.categories?.length) {
            await prisma.productcategorymapping.createMany({
                data: productData.categories.map(category => ({
                    proid: BigInt(productId),
                    catid: BigInt(category.catid),
                    createdby: BigInt(userData.uid),
                    isdeleted: false
                }))
            });
        }

        // 4. Delete all existing variant-related data regardless of previous state
        await prisma.provariantlocations.deleteMany({
            where: { proid: BigInt(productId) }
        });

        await prisma.provarianttax.deleteMany({
            where: { proid: BigInt(productId) }
        });

        await prisma.uom_mapping.deleteMany({
            where: { proid: BigInt(productId) }
        });

        await prisma.pvamvalues.deleteMany({
            where: { 
                pvamid: { 
                    in: await prisma.pvamapping.findMany({
                        where: { proid: BigInt(productId) },
                        select: { pvamid: true }
                    }).then(mappings => mappings.map(m => m.pvamid))
                }
            }
        });

        await prisma.pvamapping.deleteMany({
            where: { proid: BigInt(productId) }
        });

        await prisma.provariants.deleteMany({
            where: { proid: BigInt(productId) }
        });

        // 5. Create new variants based on current hasvarient flag
        if (productData.hasvarient) {
            // Multiple variants case
            for (const variantData of productData.variants) {
                const variant = await prisma.provariants.create({
                    data: {
                        proid: BigInt(productId),
                        pvname: variantData.pvname || '',
                        pvdesc: variantData.pvdesc || '',
                        pvbarcode: variantData.pvbarcode,
                        pvpurchaseprice: new Decimal(variantData.pvpurchaseprice),
                        pvsalesprice: new Decimal(variantData.pvsalesprice),
                        reconciliation_price: new Decimal(variantData.reconciliation_price),
                        normal_loss: new Decimal(variantData.normal_loss),
                        uoid: BigInt(userData.uoid),
                        createdby: BigInt(userData.uid),
                        isdeleted: false
                    }
                });

                await createVariantRelatedData(prisma, variant.pvid, productId, variantData, userData);
            }
        } else {
            // Single variant case
            const variantData = productData.variant;
            const variant = await prisma.provariants.create({
                data: {
                    proid: BigInt(productId),
                    pvname: variantData.pvname || '',
                    pvdesc: variantData.pvdesc || '',
                    pvbarcode: variantData.pvbarcode,
                    pvpurchaseprice: new Decimal(variantData.pvpurchaseprice),
                    pvsalesprice: new Decimal(variantData.pvsalesprice),
                    reconciliation_price: new Decimal(variantData.reconciliation_price),
                    normal_loss: new Decimal(variantData.normal_loss),
                    uoid: BigInt(userData.uoid),
                    createdby: BigInt(userData.uid),
                    isdeleted: false
                }
            });

            await createVariantRelatedData(prisma, variant.pvid, productId, variantData, userData);
        }

        return await getProductById(productId, userData.uoid);
    });
};

// Helper function to create variant-related data
const createVariantRelatedData = async (prisma, pvid, productId, variantData, userData) => {
    // Create variant location
    if (variantData.location) {
        await prisma.provariantlocations.create({
            data: {
                proid: BigInt(productId),
                pvid: pvid,
                safetylevel: new Decimal(variantData.location.safetylevel || 0),
                reorderlevel: new Decimal(variantData.location.reorderlevel || 0),
                min_stock_uom: BigInt(variantData.location.min_stock_uom),
                par_stock_uom: BigInt(variantData.location.par_stock_uom),
                closingstock_on: Array.isArray(variantData.location.closingstock_on) 
                    ? variantData.location.closingstock_on.map(Number) 
                    : [],
                openingstock: new Decimal(variantData.location.openingstock || 0),
                closingstock: new Decimal(variantData.location.closingstock || 0),
                autorenew: variantData.location.autorenew,
                createdby: BigInt(userData.uid),
                uoid: BigInt(userData.uoid),
                isdeleted: false
            }
        });
    }

    // Create variant tax
    if (variantData.tax) {
        await prisma.provarianttax.create({
            data: {
                proid: BigInt(productId),
                pvid: pvid,
                taxrate: new Decimal(variantData.tax.taxrate),
                hsncode: variantData.tax.hsncode,
                createdby: BigInt(userData.uid),
                isdeleted: false
            }
        });
    }

    // Create UOM mappings
    for (const uom of variantData.purchaseUoms) {
        await prisma.uom_mapping.create({
            data: {
                proid: BigInt(productId),
                pvid: pvid,
                uomid: BigInt(uom.uomid),
                is_default: uom.is_default,
                uom_type: BigInt(21), // Purchase UOM type
                createdby: BigInt(userData.uid),
                isdeleted: false
            }
        });
    }

    if (variantData.consumptionUom) {
        await prisma.uom_mapping.create({
            data: {
                proid: BigInt(productId),
                pvid: pvid,
                uomid: variantData.consumptionUom.uomid ? BigInt(variantData.consumptionUom.uomid) : null,
                is_default: true,
                uom_type: BigInt(22), // Consumption UOM type
                createdby: BigInt(userData.uid),
                isdeleted: false
            }
        });
    }

    // Create attribute mappings
    for (const mapping of variantData.pvamappings) {
        const pvamapping = await prisma.pvamapping.create({
            data: {
                proid: BigInt(productId),
                pvid: pvid,
                attributeid: BigInt(mapping.attributeid),
                attrtextprompt: mapping.attrtextprompt,
                isrequired: mapping.isrequired,
                controltype: mapping.controltype,
                displayorder: mapping.displayorder,
                createdby: BigInt(userData.uid),
                isdeleted: false
            }
        });

        // Create attribute values
        for (const value of mapping.pvamvaluemodels) {
            await prisma.pvamvalues.create({
                data: {
                    pvamid: pvamapping.pvamid,
                    avid: BigInt(value.avid),
                    pvamvcolor: value.pvamvcolor,
                    umid: value.umid ? BigInt(value.umid) : null,
                    displayorder: value.displayorder,
                    createdby: BigInt(userData.uid),
                    isdeleted: false
                }
            });
        }
    }

};

export const filterProducts = async (filters, uoid, skip, limit) => {
    // Build where conditions
    const where = {
        uoid: BigInt(uoid),
        isdeleted: false,
        ...(filters.proname && {
            proname: {
                contains: filters.proname,
                mode: 'insensitive'
            }
        }),
        ...(filters.proconfig !== undefined && {
            proconfig: filters.proconfig
        }),
        ...(filters.catid && {
            productcategorymapping: {
                some: {
                    catid: BigInt(filters.catid),
                    isdeleted: false
                }
            }
        }),
        ...(filters.isfa !== undefined && {
            proisfa: filters.isfa
        })
    };

    // Get total count
    const totalCount = await prisma.product.count({ where });

    // Get products with all relations
    const products = await prisma.product.findMany({
        where,
        include: {
            unitofmeasure: {
                select: {
                    uomid: true,
                    uomname: true,
                }
            },
            productcategorymapping: {
                where: { isdeleted: false },
                include: {
                    categories: true,
                }
            },
            pvummapping: {
                where: { isdeleted: false },
                include: {
                    userimages: true
                }
            },
            provariants: {
                where: { isdeleted: false },
                include: {
                    provariantlocations: {
                        where: { isdeleted: false }
                    },
                    provarianttax: {
                        where: { isdeleted: false }
                    },
                    uom_mapping: {
                        where: { isdeleted: false },
                        include: {
                            unitofmeasure: true
                        }
                    },
                    pvamapping: {
                        where: { isdeleted: false },
                        include: {
                            attributes: true,
                            pvamvalues: {
                                where: { isdeleted: false },
                                include: {
                                    attributevalues: true
                                }
                            }
                        }
                    }
                }
            },
        },
        ...(limit !== undefined && { take: limit }),
        ...(skip !== undefined && { skip: skip }),
        orderBy: {
            proid: 'asc'
        }
    });

    return { products, totalCount };
};

export const deleteProduct = async (productId, userData) => {
    return await prisma.$transaction(async (prisma) => {
        // Delete base product
        await prisma.product.update({
            where: { proid: BigInt(productId) },
            data: {
                isdeleted: true,
                modifiedby: BigInt(userData.uid),
                modifieddate: new Date()
            }
        });

        // Delete category mappings
        await prisma.productcategorymapping.deleteMany({
            where: { proid: BigInt(productId) }
        });

        // Delete variants
        await prisma.provariants.deleteMany({
            where: { proid: BigInt(productId) }
        });

        // Delete variant locations
        await prisma.provariantlocations.deleteMany({
            where: { proid: BigInt(productId) }
        });

        // Delete variant taxes
        await prisma.provarianttax.deleteMany({
            where: { proid: BigInt(productId) }
        });

        // Delete UOM mappings
        await prisma.uom_mapping.deleteMany({
            where: { proid: BigInt(productId) }
        });

        // Delete attribute mappings
        await prisma.pvamapping.deleteMany({
            where: { proid: BigInt(productId) }
        });

        await prisma.pvamvalues.deleteMany({
            where: { pvamid: { in: prisma.pvamapping.findMany({ where: { proid: BigInt(productId) } }).then(mappings => mappings.map(m => m.pvamid)) } }
        });

        return await getProductById(productId, userData.uoid);
    });
};

// Helper function to transform variant data
const transformVariant = (variant) => {
    if (!variant) return null;
    
    return {
        pvid: variant.pvid.toString(),
        pvname: variant.pvname,
        pvdesc: variant.pvdesc,
        pvbarcode: variant.pvbarcode,
        pvpurchaseprice: variant.pvpurchaseprice.toString(),
        pvsalesprice: variant.pvsalesprice.toString(),
        reconciliation_price: variant.reconciliation_price?.toString(),
        normal_loss: variant.normal_loss?.toString(),
        
        // Transform location data
        location: variant.provariantlocations[0] ? {
            safetylevel: variant.provariantlocations[0].safetylevel.toString(),
            reorderlevel: variant.provariantlocations[0].reorderlevel.toString(),
            min_stock_uom: variant.provariantlocations[0].min_stock_uom.toString(),
            min_stock_uom_name: variant.provariantlocations[0].unitofmeasure_provariantlocations_min_stock_uomTounitofmeasure?.uomname,
            par_stock_uom: variant.provariantlocations[0].par_stock_uom.toString(),
            par_stock_uom_name: variant.provariantlocations[0].unitofmeasure_provariantlocations_par_stock_uomTounitofmeasure?.uomname,
            closingstock_on: variant.provariantlocations[0].closingstock_on
        } : null,

        // Transform tax data
        tax: variant.provarianttax[0] ? {
            taxrate: variant.provarianttax[0].taxrate.toString(),
            hsncode: variant.provarianttax[0].hsncode
        } : null,

        // Transform UOM mappings
        purchaseUoms: variant.uom_mapping
            .filter(uom => uom.uom_type.toString() === '21')
            .map(uom => ({
                uomid: uom.uomid.toString(),
                is_default: uom.is_default,
                uomname: uom.unitofmeasure?.uomname
            })),

        consumptionUom: variant.uom_mapping.find(uom => uom.uom_type.toString() === '22')
            ? {
                uomid: variant.uom_mapping.find(uom => uom.uom_type.toString() === '22').uomid.toString(),
                uomname: variant.uom_mapping.find(uom => uom.uom_type.toString() === '22').unitofmeasure?.uomname
            }
            : null,

        // Transform attribute mappings
        pvamappings: variant.pvamapping.map(mapping => ({
            pvamid: mapping.pvamid.toString(),
            attributeid: mapping.attributeid.toString(),
            attributename: mapping.attributes?.attributename,
            attrtextprompt: mapping.attrtextprompt,
            isrequired: mapping.isrequired,
            controltype: mapping.controltype,
            displayorder: mapping.displayorder,
            pvamvaluemodels: mapping.pvamvalues.map(value => ({
                pvamvid: value.pvamvid.toString(),
                avid: value.attributevalues?.avid.toString(),
                avname: value.attributevalues?.avname,
                pvamvcolor: value.pvamvcolor,
                umid: value.umid?.toString(),
                displayorder: value.displayorder
            }))
        }))
    };
};