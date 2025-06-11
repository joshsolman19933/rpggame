import { MongoClient } from 'mongodb';

async function checkMaterials() {
  console.log('=== NYERSANYAGOK ELLENŐRZÉSE ===');
  
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';
  console.log(`Csatlakozás: ${MONGODB_URI}`);
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Csatlakozás az adatbázishoz
    console.log('Csatlakozás az adatbázishoz...');
    await client.connect();
    console.log('✅ Sikeres csatlakozás');
    
    const db = client.db();
    console.log(`Adatbázis: ${db.databaseName}`);
    
    // Nyersanyagok lekérdezése
    const materials = db.collection('materials');
    const materialCount = await materials.countDocuments();
    console.log(`\nÖsszesen ${materialCount} nyersanyag található az adatbázisban`);
    
    if (materialCount > 0) {
      console.log('\nNyersanyagok listája:');
      const allMaterials = await materials.find({}).toArray();
      
      allMaterials.forEach((mat, index) => {
        console.log(`\n${index + 1}. ${mat.name} (${mat.type})`);
        console.log(`   - Leírás: ${mat.description}`);
        console.log(`   - Ritkaság: ${mat.rarity}`);
        console.log(`   - Alapérték: ${mat.baseValue} arany`);
        console.log(`   - Súly: ${mat.weight} kg`);
        console.log(`   - Gyűjtési készség: ${mat.gatherSkill}`);
        
        if (mat.gatherTime) {
          console.log(`   - Gyűjtési idő: ${mat.gatherTime} másodperc`);
        }
        
        if (mat.stackSize) {
          console.log(`   - Veremméret: ${mat.stackSize} db`);
        }
      });
    } else {
      console.log('Nincsenek nyersanyagok az adatbázisban.');
    }
    
    return true;
  } catch (error) {
    console.error('Hiba a nyersanyagok ellenőrzése közben:', error);
    return false;
  } finally {
    await client.close();
    console.log('\nKapcsolat bezárva');
  }
}

// Futtatás
checkMaterials()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Váratlan hiba:', err);
    process.exit(1);
  });
