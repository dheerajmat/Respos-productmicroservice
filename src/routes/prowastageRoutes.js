import express from 'express';
import * as prowastageController from '../controllers/prowastageController.js';

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Wastage:
 *       type: object
 *       required:
 *         - wastageno
 *         - seriesid
 *         - proid
 *         - wastageqty
 *         - wastagevalue
 *         - wastagedate
 *         - uomid
 *         - wastagetype
 *       properties:
 *         wastageid:
 *           type: integer
 *           format: int64
 *           description: The auto-generated id of the wastage
 *         wastageno:
 *           type: string
 *           description: Wastage reference number
 *         seriesid:
 *           type: integer
 *           format: int64
 *           description: Series identifier
 *         proid:
 *           type: integer
 *           format: int64
 *           description: Product identifier
 *         pvid:
 *           type: integer
 *           format: int64
 *           description: Product variant identifier
 *         wastageqty:
 *           type: number
 *           format: decimal
 *           description: Quantity of wastage
 *         wastagevalue:
 *           type: number
 *           format: decimal
 *           description: Value of wastage
 *         wastagedate:
 *           type: string
 *           format: date
 *           description: Date of wastage
 *         dom:
 *           type: string
 *           format: date
 *           description: Date of manufacture
 *         doe:
 *           type: string
 *           format: date
 *           description: Date of expiry
 *         bcode:
 *           type: string
 *           description: Batch code
 *         fcode:
 *           type: string
 *           description: Factory code
 *         remarks:
 *           type: string
 *           description: Additional remarks
 *         uomid:
 *           type: integer
 *           format: int64
 *           description: Unit of measure identifier
 *         wastagetype:
 *           type: integer
 *           format: int64
 *           description: Type of wastage
 *         attachments:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of attachment IDs
 *         proisfa:
 *           type: boolean
 *           description: Indicates if the product is IFA
 *     WastageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/Wastage'
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Wastage'
 *         pagination:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: integer
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             itemsPerPage:
 *               type: integer
 */

/**
 * @swagger
 * /api/v2/prowastage/modal:
 *   get:
 *     summary: Get modal data for wastage creation
 *     tags: [Wastage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: proisfa
 *         schema:
 *           type: boolean
 *         description: Filter products by IFA status
 *     responses:
 *       200:
 *         description: Modal data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     template:
 *                       $ref: '#/components/schemas/Wastage'
 *                     dropdowns:
 *                       type: object
 *                       properties:
 *                         products:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               proid:
 *                                 type: integer
 *                               proname:
 *                                 type: string
 *                               prouom:
 *                                 type: integer
 *                               prouomname:
 *                                 type: string
 *                         wastageTypes:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               value:
 *                                 type: string
 */
router.get('/modal',
    prowastageController.getWastageModal
);

/**
 * @swagger
 * /api/v2/prowastage:
 *   post:
 *     summary: Create a new wastage record
 *     tags: [Wastage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Wastage'
 *     responses:
 *       201:
 *         description: Wastage created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WastageResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/',
    prowastageController.createWastage
);

/**
 * @swagger
 * /api/v2/prowastage/{id}:
 *   get:
 *     summary: Get a wastage record by ID
 *     tags: [Wastage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Wastage ID
 *     responses:
 *       200:
 *         description: Wastage record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WastageResponse'
 *       404:
 *         description: Wastage not found
 */
router.get('/:id',

    prowastageController.getWastage
);



/**
 * @swagger
 * /api/v2/prowastage/{id}:
 *   put:
 *     summary: Update a wastage record
 *     tags: [Wastage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Wastage ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Wastage'
 *     responses:
 *       200:
 *         description: Wastage updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WastageResponse'
 *       404:
 *         description: Wastage not found
 */
router.put('/:id',

    prowastageController.updateWastage
);

/**
 * @swagger
 * /api/v2/prowastage/{id}:
 *   delete:
 *     summary: Delete a wastage record
 *     tags: [Wastage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Wastage ID
 *     responses:
 *       200:
 *         description: Wastage deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Wastage not found
 */
router.delete('/:id',

    prowastageController.deleteWastage
);

/**
 * @swagger
 * /api/v2/prowastage/list:
 *   post:
 *     summary: Get paginated list of wastage records
 *     tags: [Wastage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 default: 10
 *               proisfa:
 *                 type: boolean
 *                 default: false
 *                 description: Filter wastages by IFA status. If true, shows only IFA wastages. If false, shows non-IFA wastages. If not provided, shows all wastages.
 *     responses:
 *       200:
 *         description: List of wastage records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.post('/list',
    prowastageController.listWastages
);

export default router; 