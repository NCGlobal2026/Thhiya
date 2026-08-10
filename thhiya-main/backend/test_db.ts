import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thhiya');
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;

  if (!db) {
    console.error('No db connection');
    process.exit(1);
  }

  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const coll = db.collection(c.name);

    // Stringify and search all docs to find 'Service 1'
    const allDocs = await coll.find().toArray();
    let found = 0;
    for (const d of allDocs) {
      if (JSON.stringify(d).includes("Service 1")) {
        found++;
        // console.log(`Found "Service 1" in collection ${c.name} doc _id: ${d._id}`);
      }
    }
    if (found > 0) {
      console.log(`Found "Service 1" in collection ${c.name} ${found} times.`);
    }
  }
  process.exit(0);
}
run();
