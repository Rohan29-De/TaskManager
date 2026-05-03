const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});
const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`- ${u.name} (${u.email})`));
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkUsers();
