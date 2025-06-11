import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { body } from 'express-validator';
import { 
  createVillage, 
  getMyVillage, 
  getVillageBuildings, 
  upgradeBuilding,
  AuthenticatedRequest
} from '../controllers/villageController';
import { protect } from '../middleware/auth';

// Típusok definiálása
type AsyncRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

// Segédfüggvény az aszinkron kérések kezeléséhez
const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // A protect middleware már beállítja a user-t a request-be
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};

const router = express.Router();

// Minden útválasztó védett
router.use(protect);

// Falu létrehozása
router.post(
  '/',
  [
    body('name', 'A falu neve kötelező')
      .notEmpty()
      .trim()
      .isLength({ max: 30 })
      .withMessage('A falu neve maximum 30 karakter hosszú lehet'),
    body('coordinates.x', 'Érvénytelen X koordináta').isNumeric(),
    body('coordinates.y', 'Érvénytelen Y koordináta').isNumeric(),
    body('coordinates.region', 'A régió megadása kötelező').notEmpty()
  ],
  asyncHandler(createVillage)
);

// Saját falu adatainak lekérdezése
router.get('/me', asyncHandler(getMyVillage));

// Falu épületeinek lekérdezése
router.get('/:villageId/buildings', asyncHandler(getVillageBuildings));

// Épület fejlesztése
router.post(
  '/:villageId/buildings/:buildingId/upgrade',
  [
    body('villageId', 'Érvénytelen falu azonosító')
      .notEmpty()
      .isMongoId()
  ],
  asyncHandler(upgradeBuilding)
);

export default router;
