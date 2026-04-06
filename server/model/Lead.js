// models/Lead.js
import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    // Basic Information
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    destination: { type: String, required: true },
    profile: { type: String, enum: ['student', 'professional', 'business', 'tourist'], required: true },
    message: { type: String, required: true },
    
    // Pipeline Status
    status: {
        type: String,
        enum: ['new', 'contacted', 'counselling', 'coaching', 'documentation', 'visa_process', 'interview', 'application_submitted', 'offer_received', 'visa_granted', 'travel_arranged', 'converted', 'lost', 'on_hold'],
        default: 'new'
    },
    
    // Stage-specific fields
    counselling: {
                counsellor: { type: String },
                counsellingDate: Date,
                notes: String,
                followUpDate: Date,
                interestedCourse: String,
                preferredUniversity: String
    },
    
    coaching: {
                coachingType: { type: String, enum: ['PTE', 'IELTS', 'TOEFL', 'GRE', 'GMAT', 'None'] },
                enrolledDate: Date,
                coachingCenter: String,
                currentScore: Number,
                targetScore: Number,
                batchTiming: String,
                instructor: String,
                progress: { type: Number, min: 0, max: 100 }
    },
    
    documentation: {
                documentsReceived: [{
                    documentName: String,
                    receivedDate: Date,
                    verified: Boolean,
                    notes: String
                }],
                documentsPending: [String],
                documentChecker: String,
                completenessScore: { type: Number, min: 0, max: 100 }
    },
    
   // models/Lead.js - Add default values for visa subdocuments
visa: {
    visaType: { type: String, default: '' },
    appliedDate: { type: Date, default: null },
    visaOffice: { type: String, default: '' },
    applicationId: { type: String, default: '' },
    biometricsDate: { type: Date, default: null },
    interviewDate: { type: Date, default: null },
    decisionDate: { type: Date, default: null },
    decision: { type: String, enum: ['pending', 'approved', 'rejected', 'refused'], default: 'pending' },
    financialDocuments: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    passportDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    previousVisaHistory: {
        type: Array,
        default: []
    },
    medicalExam: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    additionalInfo: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
},
    
    application: {
                universityName: String,
                courseName: String,
                intakeDate: Date,
                applicationFee: Number,
                applicationDate: Date,
                offerLetterReceived: Boolean,
                offerLetterDate: Date,
                acceptanceDeadline: Date,
                scholarship: {
                    awarded: Boolean,
                    amount: Number,
                    scholarshipName: String
                }
    },
    
    // Additional dynamic fields
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Notes and Communication
    notes: [{
        note: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
        noteType: { type: String, enum: ['general', 'important', 'follow_up', 'client_request'] }
    }],
    
    communications: [{
        type: { type: String, enum: ['call', 'email', 'whatsapp', 'meeting', 'other'] },
        date: Date,
        summary: String,
        followUpNeeded: Boolean,
        followUpDate: Date,
        conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    
    // Financial Information
    financial: {
                serviceFee: { type: Number, default: 0 },
                paidAmount: { type: Number, default: 0 },
                paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
                payments: [{
                    amount: Number,
                    date: Date,
                    method: String,
                    receiptNumber: String,
                    notes: String
                }]
    },
    
    // Assigned To
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastContactedAt: Date,
    expectedClosureDate: Date,
    closedAt: Date,
    closedReason: String
}, {
    timestamps: true
});

// Indexes for better query performance
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ createdAt: -1 });

export default mongoose.model('Lead', leadSchema);