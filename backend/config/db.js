const mongoose = require('mongoose');
const dns = require('dns');

// Fixes "querySrv ECONNREFUSED" when connecting to MongoDB Atlas from some Windows machines.
// Node's own DNS resolver sometimes can't reach the OS-configured DNS server even though
// the OS resolver (nslookup, browsers, etc.) works fine - pointing Node at a public DNS
// server directly sidesteps that.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
