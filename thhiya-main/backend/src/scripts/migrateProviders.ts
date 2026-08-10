import mongoose from 'mongoose';
import Provider from '../models/Provider';

(async () => {
  const [d, p] = [process.env.MONGODB_URI, process.env.PROD_MONGODB_URI];
  if (!d || !p) return console.error('Set MONGODB_URI & PROD_MONGODB_URI in your .env file');

  console.log('Connecting to Dev and Prod databases...');
  const [dC, pC] = await Promise.all([
    mongoose.createConnection(d).asPromise(),
    mongoose.createConnection(p).asPromise()
  ]);

  const syncCollection = async (name: string, schema: mongoose.Schema) => {
    console.log(`\nSyncing ${name}s...`);
    const devM = dC.model(name, schema);
    const prodM = pC.model(name, schema);

    // Fetch ALL documents from development
    const docs = await devM.find({}).lean() as any[];

    if (!docs.length) {
      console.log(`No ${name}s found in Dev.`);
      return;
    }

    console.log(`Preparing to sync ${docs.length} ${name}s...`);

    const ops = docs.map(({ _id, __v, createdAt, updatedAt, ...data }) => ({
      updateOne: { 
        filter: { slug: data.slug }, 
        update: { $set: data }, 
        upsert: true 
      }
    }));

    const res = await prodM.bulkWrite(ops);
    console.log(`${name} Sync Result:`);
    console.log(` - Upserted (New): ${res.upsertedCount}`);
    console.log(` - Modified (Updated): ${res.modifiedCount}`);
    console.log(` - Matched: ${res.matchedCount}`);
  };

  await syncCollection('Provider', Provider.schema);

  console.log('\nGlobal Sync complete.');
  await Promise.all([dC.close(), pC.close()]);
  process.exit(0);
})().catch(console.error);
