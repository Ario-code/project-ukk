const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = {};

  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local not found. Please make sure your MongoDB URI exists.');
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }

  return env;
}

async function main() {
  const env = loadEnvLocal();
  const uri = env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI belum ada di .env.local');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
  });

  const userSchema = new mongoose.Schema(
    {
      nama: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'guru', 'murid', 'kepsek', 'wakakurikulum'], default: 'murid' },
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const email = 'murid@smk.test';
  const password = 'murid123';

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log('Murid already exists:');
    console.log({ email: existing.email, role: existing.role });
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    nama: 'Alex Student',
    email,
    password: hashedPassword,
    role: 'murid',
  });

  console.log('Murid created successfully');
  console.log('Email: murid@smk.test');
  console.log('Password: murid123');
  console.log('Role: murid');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed murid failed');
  console.error(error.message || error);
  process.exit(1);
});