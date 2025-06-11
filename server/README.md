# RPG Játék Szerver

Ez a projekt egy böngészős RPG játék szerveroldali komponense, amelyet TypeScript-ben írtunk Node.js és Express segítségével.

## Előfeltételek

- Node.js (14.x vagy újabb)
- npm (Node.js-szel együtt települ)
- MongoDB adatbázis (helyi vagy MongoDB Atlas)

## Telepítés

1. Klónozd le a repository-t:
   ```bash
   git clone <repository-url>
   cd rpg-game/server
   ```

2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```

3. Hozz létre egy `.env` fájlt a gyökérkönyvtárban a következő környezeti változókkal:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/rpg-game
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

## Fejlesztői módban indítás

```bash
npm run dev
```

A szerver a `http://localhost:5000` címen fog elindulni.

## Éles környezetben történő indítás

1. Építsd le a kódot:
   ```bash
   npm run build
   ```

2. Indítsd el a szervert:
   ```bash
   npm start
   ```

## API Végpontok

### Regisztráció

```
POST /api/auth/register
```

**Request body:**
```json
{
  "username": "felhasznalo1",
  "email": "pelda@email.com",
  "password": "jelszo123",
  "confirmPassword": "jelszo123"
}
```

### Bejelentkezés

```
POST /api/auth/login
```

**Request body:**
```json
{
  "email": "pelda@email.com",
  "password": "jelszo123"
}
```

### Profil lekérése

```
GET /api/auth/profile
```

**Fejléc:**
```
Authorization: Bearer <token>
```

## Fejlesztés

### Kódstílus

- Használj TypeScript típusokat mindenhol
- Kövesd az Airbnb JavaScript stílusvezérlőt
- Írj teszteket az új funkciókhoz

### Közreműködés

1. Fork-old a repository-t
2. Hozz létre egy új branchet (`git checkout -b feature/uj-funkcio`)
3. Commitolj a változtatásaidat (`git commit -am 'Új funkció hozzáadva'`)
4. Push-old a branchet (`git push origin feature/uj-funkcio`)
5. Hozz létre egy Pull Request-et

## Licenc

Ez a projekt az MIT licenc alatt áll.
