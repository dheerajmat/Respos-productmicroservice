import express from 'express';
import { createProduct, createVariant, deleteProduct, deleteVariant, filterProducts, getProductById, getProducts, getProductToCreateModal, getVariantById, getVariants, updateProduct, updateVariant, createFixedAsset, getFixedAssetById, updateFixedAsset, getFixedAssetModal } from '../controllers/productController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Variant:
 *       type: object
 *       properties:
 *         pvbarcode:
 *           type: string
 *         pvpurchaseprice:
 *           type: number
 *         pvsalesprice:
 *           type: number
 *         reconciliation_price:
 *           type: number
 *         normal_loss:
 *           type: number
 *         location:
 *           type: object
 *           properties:
 *             safetylevel:
 *               type: number
 *             reorderlevel:
 *               type: number
 *             min_stock_uom:
 *               type: string
 *             par_stock_uom:
 *               type: string
 *             closingstock_on:
 *               type: object
 *         tax:
 *           type: object
 *           properties:
 *             taxrate:
 *               type: number
 *             hsncode:
 *               type: number
 *         purchaseUoms:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               uomid:
 *                 type: number
 *               is_default:
 *                 type: boolean
 *         consumptionUom:
 *           type: object
 *           properties:
 *             uomid:
 *               type: number
 *         pvamappings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pvamid:
 *                 type: number
 *               attributeid:
 *                 type: number
 *               attributeName:
 *                 type: string
 *               attrtextprompt:
 *                 type: string
 *               isrequired:
 *                 type: boolean
 *               controltype:
 *                 type: number
 *               displayorder:
 *                 type: number
 *               pvamvaluemodels:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     avid:
 *                       type: number
 *                     attributeid:
 *                       type: number
 *                     avname:
 *                       type: string
 *                     avdisplayorder:
 *                       type: string
 *                     uoid:
 *                       type: number
 *                     avicon:
 *                       type: string
 *                     avcolor:
 *                       type: string
 *                     pvamvid:
 *                       type: number
 *                     pvamvcolor:
 *                       type: string
 *                     umid:
 *                       type: number
 *                     attributeValueName:
 *                       type: string
 *                     displayorder:
 *                       type: number
 *     Product:
 *       type: object
 *       properties:
 *         proname:
 *           type: string
 *         prodescription:
 *           type: string
 *         proconfig:
 *           type: number
 *         catids:
 *           type: array
 *           items:
 *             type: number
 *         prouom:
 *           type: number
 *         productimgid:
 *           type: number
 *         hasvarient:
 *           type: boolean
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Variant'
 *         variant:
 *           $ref: '#/components/schemas/Variant'
 */



/**
 * @swagger
 * /api/v2/products/modal:
 *   get:
 *     summary: Get product creation modal template and dropdowns
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Modal template and dropdown data
 */
router.get('/modal', getProductToCreateModal);


/**
 * @swagger
 * /api/v2/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', createProduct);

/**
 * @swagger
 * /api/v2/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/v2/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/v2/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 */
router.put('/:id', updateProduct);


/**
 * @swagger
 * /api/v2/products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', deleteProduct);

// /**
//  * @swagger
//  * /api/products/uoms/{catid}:
//  *   get:
//  *     summary: Get UOMs by category ID
//  *     tags: [Products]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: catid
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: List of UOMs for the category
//  */
// router.get('/uoms/:catid', getUomsByCategory);

/**
 * @swagger
 * /api/v2/products/filter:
 *   post:
 *     summary: Get filtered products with pagination
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proname:
 *                 type: string
 *                 description: Product name to filter by
 *               proconfig:
 *                 type: integer
 *                 description: Product configuration to filter by
 *               catid:
 *                 type: integer
 *                 description: Category ID to filter by
 *               isfa:
 *                 type: boolean
 *                 description: Filter by fixed asset status
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 default: 10
 *     responses:
 *       200:
 *         description: Filtered products with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 totalCount:
 *                   type: integer
 *                   description: Total number of products matching the filter
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *       400:
 *         description: Invalid filter parameters
 *       401:
 *         description: Unauthorized
 */
router.post('/filter', filterProducts);



/**
 * @swagger
 * components:
 *   schemas:
 *     VariantLocation:
 *       type: object
 *       properties:
 *         safetylevel:
 *           type: number
 *           description: Safety stock level
 *           example: 100
 *         reorderlevel:
 *           type: number
 *           description: Reorder point level
 *           example: 50
 *         min_stock_uom:
 *           type: integer
 *           description: Minimum stock unit of measure ID
 *           example: 1
 *         par_stock_uom:
 *           type: integer
 *           description: Par stock unit of measure ID
 *           example: 1
 *
 *     VariantTax:
 *       type: object
 *       properties:
 *         taxrate:
 *           type: number
 *           description: Tax rate percentage
 *           example: 18
 *         hsncode:
 *           type: integer
 *           description: HSN code for the variant
 *           example: 84713010
 *
 *     ProductVariant:
 *       type: object
 *       required:
 *         - pvname
 *         - pvbarcode
 *         - pvpurchaseprice
 *         - pvsalesprice
 *       properties:
 *         pvname:
 *           type: string
 *           description: Name of the variant
 *           example: "Large Size Blue"
 *         pvdesc:
 *           type: string
 *           description: Detailed description of the variant
 *           example: "Large size variant in blue color"
 *         shortdesc:
 *           type: string
 *           description: Short description of the variant
 *           example: "Large Blue"
 *         pvbarcode:
 *           type: string
 *           description: Unique barcode for the variant
 *           example: "VAR123456"
 *         pvsku:
 *           type: string
 *           description: SKU code for the variant
 *           example: "SKU-LRG-BLU"
 *         pvdefaultimgid:
 *           type: integer
 *           description: Default image ID for the variant
 *           example: 1
 *         pvstatus:
 *           type: integer
 *           description: Status of the variant
 *           example: 1
 *         pvsalesprice:
 *           type: number
 *           description: Sales price of the variant
 *           example: 150.75
 *         pvpurchaseprice:
 *           type: number
 *           description: Purchase price of the variant
 *           example: 100.50
 *         pvoldprice:
 *           type: number
 *           description: Old price of the variant
 *           example: 160.00
 *         pvspecialprice:
 *           type: number
 *           description: Special price of the variant
 *           example: 140.00
 *         pvspstartdate:
 *           type: string
 *           format: date-time
 *           description: Special price start date
 *         pvspenddate:
 *           type: string
 *           format: date-time
 *           description: Special price end date
 *         moq:
 *           type: number
 *           description: Minimum order quantity
 *           example: 5
 *         isinclusive:
 *           type: boolean
 *           description: Whether price is inclusive of tax
 *           example: false
 *         ispublished:
 *           type: boolean
 *           description: Whether variant is published
 *           example: true
 *         displayOnHomePage:
 *           type: boolean
 *           description: Whether to display on home page
 *           example: false
 *         admincomment:
 *           type: string
 *           description: Admin comments for the variant
 *           example: "New summer collection variant"
 *         reconciliation_price:
 *           type: number
 *           description: Price used for reconciliation
 *           example: 125.00
 *         normal_loss:
 *           type: number
 *           description: Normal loss percentage
 *           example: 2.5
 *         location:
 *           $ref: '#/components/schemas/VariantLocation'
 *         tax:
 *           $ref: '#/components/schemas/VariantTax'
 *
 *     VariantResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/ProductVariant'
 *
 *     VariantListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
 */


/**
 * @swagger
 * /api/v1/products/{productId}/variants:
 *   post:
 *     summary: Create a new variant for a product
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to create variant for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariant'
 *     responses:
 *       201:
 *         description: Variant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VariantResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *
 *   get:
 *     summary: Get all variants for a product
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to get variants for
 *     responses:
 *       200:
 *         description: List of variants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VariantListResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 * 
 *
 * /api/v1/products/{productId}/variants/{variantId}:
 *   get:
 *     summary: Get a specific variant
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the variant
 *     responses:
 *       200:
 *         description: Variant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VariantResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Variant not found
 *
 *   put:
 *     summary: Update a variant
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the variant to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariant'
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VariantResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Variant not found
 *
 *   delete:
 *     summary: Delete a variant
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the variant to delete
 *     responses:
 *       200:
 *         description: Variant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Variant deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Variant not found
 */


router.post('/:productId/variants', createVariant);

// Get all variants for a product
router.get('/:productId/variants', getVariants);

// Get specific variant
router.get('/:productId/variants/:variantId', getVariantById);

// Update variant
router.put('/:productId/variants/:variantId', updateVariant);

// Delete variant
router.delete('/:productId/variants/:variantId', deleteVariant);

/**
 * @swagger
 * /api/v2/products/fixed-asset/modal:
 *   get:
 *     summary: Get fixed asset creation modal template and dropdowns
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Modal template and dropdown data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modal:
 *                   type: object
 *                   properties:
 *                     proname:
 *                       type: string
 *                     prodescription:
 *                       type: string
 *                     catids:
 *                       type: array
 *                       items:
 *                         type: number
 *                     location:
 *                       type: object
 *                       properties:
 *                         openingstock:
 *                           type: number
 *                         reorderlevel:
 *                           type: number
 *                         min_stock_uom:
 *                           type: number
 *                         par_stock_uom:
 *                           type: number
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       catname:
 *                         type: string
 */
router.get('/fixed-asset/modal', getFixedAssetModal);

/**
 * @swagger
 * /api/v2/products/fixed-asset:
 *   post:
 *     summary: Create a new fixed asset product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proname
 *               - catids
 *               - prodescription
 *               - location
 *             properties:
 *               proname:
 *                 type: string
 *               catids:
 *                 type: array
 *                 items:
 *                   type: number
 *               prodescription:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   safetylevel:
 *                     type: number
 *                   reorderlevel:
 *                     type: number
 *                   min_stock_uom:
 *                     type: number
 *                   par_stock_uom:
 *                     type: number
 *     responses:
 *       201:
 *         description: Fixed asset created successfully
 */
router.post('/fixed-asset', createFixedAsset);

/**
 * @swagger
 * /api/v2/products/fixed-asset/{id}:
 *   get:
 *     summary: Get a fixed asset by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fixed asset details
 *       404:
 *         description: Fixed asset not found
 * 
 *   put:
 *     summary: Update a fixed asset
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proname:
 *                 type: string
 *               catids:
 *                 type: array
 *                 items:
 *                   type: number
 *               prodescription:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   openingstock:
 *                     type: number
 *                   min_stock_uom:
 *                     type: number
 *                   par_stock_uom:
 *                     type: number
 *     responses:
 *       200:
 *         description: Fixed asset updated successfully
 */
router.get('/fixed-asset/:id', getFixedAssetById);
router.put('/fixed-asset/:id', updateFixedAsset);



export default router;