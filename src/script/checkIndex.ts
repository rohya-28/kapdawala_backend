import mongoose from 'mongoose';

async function checkIndexes() {
  // Replace with your actual Atlas URI
  await mongoose.connect('mongodb+srv://<username>:<password>@cluster0.abcd.mongodb.net/your_db_name?retryWrites=true&w=majority');

  const Store = mongoose.model('Store', new mongoose.Schema({}, { strict: false }), 'stores');

  const indexes = await Store.collection.getIndexes();
  console.log('Indexes:', indexes);

  process.exit(0);
}

checkIndexes().catch(err => {
  console.error(err);
  process.exit(1);
});
