// models/User.js (enhanced)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'agent', 'visitor'],
        default: 'agent'
    },
    phone: String,
    department: {
        type: String,
        enum: ['sales', 'counselling', 'coaching', 'documentation', 'visa', 'management'],
        required: function() { return this.role === 'agent'; }
    },
    specialization: [{
        type: String,
        enum: ['student_visa', 'work_visa', 'business_visa', 'tourist_visa', 'ielts', 'pte', 'gre', 'gmat']
    }],
    maxLeadsAssigned: { type: Number, default: 50 },
    currentLeadsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);