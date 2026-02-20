import express from 'express';
import {
  createList,
  getMyLists,
  getListById,
  updateList,
  addMovieToList,
  removeMovieFromList,
  deleteList,
  shareListWithFriend,
  getListsSharedWithMe,
} from '../controllers/listController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', createList);
router.get('/', getMyLists);
router.get('/shared/with-me', getListsSharedWithMe);
router.get('/:listId', getListById);
router.put('/:listId', updateList);
router.post('/:listId/movies', addMovieToList);
router.delete('/:listId/movies/:movieId', removeMovieFromList);
router.post('/:listId/share', shareListWithFriend);
router.delete('/:listId', deleteList);

export default router;