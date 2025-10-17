import { Router } from 'express';
const router = Router();
import {
    createGame,
    getGameState,
    handleChatMessage,
    checkAccusation,
} from '../controllers.js/gameController.js';

// Route to create a new game session.
// POST /api/games
router.post('/', createGame);

// Route to get the current state of a specific game.
// GET /api/games/:id
router.get('/:id', getGameState);

// Route to handle sending a chat message to a character in a specific game.
// POST /api/games/:id/chat
router.post('/:id/chat', handleChatMessage);

// Route to make a final accusation in a specific game.
// POST /api/games/:id/accuse
router.post('/:id/accuse', checkAccusation);

export default router;
