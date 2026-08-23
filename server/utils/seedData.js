require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Location = require('../models/Location');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Blockchain = require('../blockchain/Blockchain');
const { hashVoterCardDocument } = require('./hashUtils');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting_system_db';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database entries...');
    await User.deleteMany({});
    await Location.deleteMany({});
    await Election.deleteMany({});
    await Candidate.deleteMany({});

    // 1. Create Multiple Diverse Location Boundaries
    console.log('Creating sample Location boundaries...');

    const loc1 = await Location.create({
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      city: 'Bengaluru',
      ward: 'Ward 42 (Indiranagar)',
    });

    const loc2 = await Location.create({
      state: 'Karnataka',
      district: 'Mysuru',
      city: 'Mysuru',
      panchayat: 'Chamundi Gram Panchayat',
    });

    const loc3 = await Location.create({
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      city: 'Mumbai',
      ward: 'Ward A (Colaba)',
    });

    const loc4 = await Location.create({
      state: 'Tamil Nadu',
      district: 'Chennai',
      city: 'Chennai',
      ward: 'Zone 9 (Mylapore)',
    });

    const loc5 = await Location.create({
      state: 'Delhi',
      district: 'New Delhi',
      city: 'New Delhi',
      ward: 'Ward 12 (Connaught Place)',
    });

    const loc6 = await Location.create({
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      ward: 'Ward 8 (Banjara Hills)',
    });

    // 2. Create Admin Account
    console.log('Creating Admin Account...');
    const sampleDescriptor = Array.from({ length: 128 }, () => 0.1);
    const admin = await User.create({
      fullName: 'Chief Election Officer',
      voterId: 'ADMIN123',
      email: 'admin@voting.gov',
      phone: '+919876543210',
      password: 'admin123',
      role: 'admin',
      location: loc1._id,
      faceDescriptor: sampleDescriptor,
      voterCardHash: hashVoterCardDocument('ADMIN123', 'ADMIN123'),
    });

    // 3. Create Sample Voters for Different Locations
    console.log('Creating Sample Voter Accounts...');
    const voter1 = await User.create({
      fullName: 'Rahul Sharma',
      voterId: 'VOTER1001',
      email: 'voter1@example.com',
      phone: '+919123456789',
      password: 'voter123',
      role: 'voter',
      location: loc1._id,
      faceDescriptor: sampleDescriptor,
      voterCardHash: hashVoterCardDocument('VOTER1001', 'VOTER1001'),
    });

    const voter2 = await User.create({
      fullName: 'Priya Kulkarni',
      voterId: 'VOTER2002',
      email: 'voter2@example.com',
      phone: '+919234567890',
      password: 'voter123',
      role: 'voter',
      location: loc3._id,
      faceDescriptor: sampleDescriptor,
      voterCardHash: hashVoterCardDocument('VOTER2002', 'VOTER2002'),
    });

    // 4. Create Location-Based Elections for Multiple Locations
    console.log('Creating Location Elections...');

    const elect1 = await Election.create({
      title: 'Bengaluru Ward 42 General Election 2026',
      description: 'Official Ward General Election for municipal representative council.',
      type: 'Ward',
      location: loc1._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Active',
      createdBy: admin._id,
    });

    const elect2 = await Election.create({
      title: 'Mumbai Ward A Colaba Municipal Election 2026',
      description: 'Municipal Corporation election for Ward A representative.',
      type: 'Municipality',
      location: loc3._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Active',
      createdBy: admin._id,
    });

    const elect3 = await Election.create({
      title: 'Chamundi Gram Panchayat General Election 2026',
      description: 'Gram Panchayat local governance council election.',
      type: 'Gram Panchayat',
      location: loc2._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Active',
      createdBy: admin._id,
    });

    // 5. Initialize Genesis Blocks on Blockchain
    console.log('Mining Genesis Blocks on Blockchain...');
    await new Blockchain(elect1._id).initializeChain();
    await new Blockchain(elect2._id).initializeChain();
    await new Blockchain(elect3._id).initializeChain();

    // 6. Create Candidates for Election 1 (Bengaluru)
    console.log('Adding Candidates for Bengaluru Ward 42...');
    await Candidate.create([
      {
        name: 'Aarav Patel',
        party: 'Progressive Democratic Alliance',
        symbolUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=150',
        election: elect1._id,
        bio: 'Focusing on smart urban infrastructure and clean energy governance.',
      },
      {
        name: 'Priya Sundaram',
        party: 'National People Party',
        symbolUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150',
        election: elect1._id,
        bio: 'Advocating for educational funding, healthcare access, and waste management.',
      },
      {
        name: 'Vikram Singh',
        party: 'Independent Citizens Front',
        symbolUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150',
        election: elect1._id,
        bio: 'Community worker dedicated to transparent municipal spending.',
      },
    ]);

    // 7. Create Candidates for Election 2 (Mumbai)
    console.log('Adding Candidates for Mumbai Ward A...');
    await Candidate.create([
      {
        name: 'Rohan Mehta',
        party: 'Mumbai Vikas Front',
        symbolUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        election: elect2._id,
        bio: 'Dedicated to coastal road infrastructure and water supply management.',
      },
      {
        name: 'Sneha Deshmukh',
        party: 'Maharashtra Citizens Party',
        symbolUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        election: elect2._id,
        bio: 'Focusing on public transport safety and urban sanitation.',
      },
    ]);

    console.log('==================================================');
    console.log('🎉 Database Seeded Successfully with 6 Diverse Locations!');
    console.log('🔑 Admin Credentials    : Voter ID: ADMIN123  | Password: admin123');
    console.log('🔑 Bengaluru Voter      : Voter ID: VOTER1001 | Password: voter123 | Location: Karnataka/Bengaluru');
    console.log('🔑 Mumbai Voter         : Voter ID: VOTER2002 | Password: voter123 | Location: Maharashtra/Mumbai');
    console.log('==================================================');

    process.exit(0);
  } catch (err) {
    console.error(`❌ Seeding failed: ${err.message}`);
    process.exit(1);
  }
};

seedDB();
