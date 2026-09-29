import express from 'express';
import { deleteThumbnail, generateThumbnail, togglePublicStatus, getCommunityThumbnails } from '../controllers/ThumbnailController.js';
import protect from '../middlewares/auth.js';

const ThumbnailRouter = express.Router();

ThumbnailRouter.post('/generate',protect, generateThumbnail)
ThumbnailRouter.delete('/delete/:id',protect, deleteThumbnail)
ThumbnailRouter.patch('/toggle-public/:id', protect, togglePublicStatus);
ThumbnailRouter.get('/community', getCommunityThumbnails); // Public route


export default ThumbnailRouter;