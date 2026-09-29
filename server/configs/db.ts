import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS SRV records resolve reliably across environments (e.g. Windows ISP DNS issues)
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
    // fallback gracefully if system custom DNS setup is unavailable
}

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('✅ MongoDB connected successfully'));
        await mongoose.connect(process.env.MONGODB_URI as string);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1); // Exit clearly so nodemon shows the real error
    }
}

export default connectDB;