import express from 'express';
import { getUsers, deleteUser } from '../controllers/userController';

const router = express.Router();

// Admin útvonalak
router.route('/').get(getUsers);
router.route('/:id').delete(deleteUser);

export default router;
