import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { dependencyInjectionContainer } from './utils/di-container';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/utils/validate-request';

const route = Express.Router();

const { userController } = dependencyInjectionContainer;

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
  [
    body('name')
      .trim()
      .notEmpty()
      .isLength({ min: 4 })
      .withMessage('Name is required'),
    body('email')
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(userController.create)
);

export default route;
