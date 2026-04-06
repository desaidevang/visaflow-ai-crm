
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from "./config/db.js";
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dns from "node:dns/promises";
import dashboardRoutes from './routes/dashboardRoutes.js';
//routes
import leadRoutes from './routes/leadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';



dns.setServers(["1.1.1.1"]);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], 
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/', (req, res) => {
  res.status(200).send('VisaFlow API is running... Health: OK');
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    mongodb: dbStatus,
    server: 'running'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`✅ CORS enabled for http://localhost:5173`);
  console.log(`✅ Credentials mode enabled for cookies`);
});