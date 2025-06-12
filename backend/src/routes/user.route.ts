import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { validateRequest } from '@middlewares/utils/validators';
import { createUserRequestValidator } from '@middlewares/utils/validators/user-request.validator';
import { userController } from '@controllers/user.controller';

const route = Express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *               email:
 *                 type: string
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 description: Password for the user
 *               currency:
 *                 type: string
 *                 description: Preferred currency of the user (e.g., USD, EUR)
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a specific user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */

// /api/users/id
route.get('/:id', asyncHandler(userController.findOne));
// /api/users
route.post(
  '/',
  createUserRequestValidator,
  validateRequest,
  asyncHandler(userController.create)
);

export default route;
