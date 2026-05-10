import { Router } from 'express';
import auth from '../../middleware/auth.middleware.js';
import admin from '../../middleware/admin.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  createSupportTicket,
  getMySupportTicket,
  getMySupportTickets,
  getSupportTicketAdmin,
  getSupportTicketsAdmin,
  replyMySupportTicket,
  updateSupportTicketAdmin,
} from './support.controller.js';

const router = Router();

router.post('/', auth, asyncHandler(createSupportTicket));
router.get('/my', auth, asyncHandler(getMySupportTickets));
router.get('/my/:id', auth, asyncHandler(getMySupportTicket));
router.post('/my/:id/reply', auth, asyncHandler(replyMySupportTicket));

router.get('/admin/tickets', auth, admin, asyncHandler(getSupportTicketsAdmin));
router.get('/admin/tickets/:id', auth, admin, asyncHandler(getSupportTicketAdmin));
router.put('/admin/tickets/:id', auth, admin, asyncHandler(updateSupportTicketAdmin));

export default router;
