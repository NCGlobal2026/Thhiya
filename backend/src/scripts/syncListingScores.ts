import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Provider from '../models/Provider';
import PurpleListing from '../models/PurpleListing';

dotenv.config();

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return console.error('MONGODB_URI not set');

  await mongoose.connect(uri);
  console.log('Connected to Local MongoDB');

  const providers = await Provider.find({ 
    intentScore: { $exists: true } 
  }).lean();

  console.log(`Found ${providers.length} providers with intent scores.`);

  let updatedCount = 0;
  for (const provider of providers) {
    const res = await PurpleListing.updateMany(
      { slug: provider.slug },
      { 
        $set: {
          intentScore: provider.intentScore,
          scoringFactors: provider.scoringFactors,
          sentimentAnalysis: provider.sentimentAnalysis
        } 
      }
    );
    if (res.modifiedCount > 0) {
      console.log(`[OK] Updated listing for ${provider.name}`);
      updatedCount += res.modifiedCount;
    }
  }

  console.log(`\nSync complete: ${updatedCount} listings updated with intent data.`);
  await mongoose.disconnect();
  process.exit(0);
})().catch(console.error);
