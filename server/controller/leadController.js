// controllers/leadController.js
import Lead from '../model/Lead.js';
import mongoose from 'mongoose';

// Create new lead (Public)
export const createLead = async (req, res) => {
    try {
        const { name, email, phone, country, destination, profile, message } = req.body;
   
        if (!name || !email || !phone || !country || !destination || !profile || !message) {
            return res.status(400).json({ message: "All fields are required." });
        }
        
        const newLead = new Lead({
            name,
            email,
            phone,
            country,
            destination,
            profile,
            message,
            assignedTo: req.user?.role === 'admin' || req.user?.role === 'agent' ? req.user._id : null
        });

        const savedLead = await newLead.save();
        res.status(201).json({ message: "Consultation request received successfully", lead: savedLead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all leads with filtering and pagination
export const getLeads = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            profile,
            assignedTo,
            search,
            fromDate,
            toDate
        } = req.query;
        
        const query = {};
        
        // Role-based access
        if (req.user.role === 'agent') {
            query.assignedTo = req.user._id;
        }
        
        if (status) query.status = status;
        if (profile) query.profile = profile;
        if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Date range filter
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) query.createdAt.$lte = new Date(toDate);
        }
        
        const leads = await Lead.find(query)
            .populate('assignedTo', 'name email role')
            .populate('notes.createdBy', 'name')
            .populate('communications.conductedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Lead.countDocuments(query);
        
        res.status(200).json({
            leads,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get single lead by ID
export const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('assignedTo', 'name email role phone')
            .populate('assignedTeam', 'name email role')
            .populate('notes.createdBy', 'name')
            .populate('communications.conductedBy', 'name');
            
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        
        // Check access
        if (req.user.role === 'agent' && lead.assignedTo?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update lead status
export const updateLeadStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        
        lead.status = status;
        
        if (notes) {
            lead.notes.push({
                note: `Status changed to ${status}: ${notes}`,
                createdBy: req.user._id,
                noteType: 'important',
                createdAt: new Date()
            });
        }
        
        if (status === 'converted' || status === 'lost') {
            lead.closedAt = new Date();
            if (status === 'lost' && notes) lead.closedReason = notes;
        }
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Status updated successfully", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update counselling information
export const updateCounselling = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        // Merge existing counselling data with new data
        lead.counselling = { ...lead.counselling, ...req.body };
        
        // Update status if needed
        if (lead.status === 'new') lead.status = 'counselling';
        
        // Add a note about counselling update
        lead.notes.push({
            note: `Counselling updated: ${req.body.notes || 'No additional notes'}`,
            createdBy: req.user._id,
            noteType: 'general',
            createdAt: new Date()
        });
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Counselling info updated", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update coaching information
export const updateCoaching = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        lead.coaching = { ...lead.coaching, ...req.body };
        
        // Update status if needed
        if (lead.status === 'counselling') lead.status = 'coaching';
        
        lead.notes.push({
            note: `Coaching info updated: Coaching Type - ${req.body.coachingType || 'Not specified'}`,
            createdBy: req.user._id,
            noteType: 'general',
            createdAt: new Date()
        });
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Coaching info updated", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update visa information
export const updateVisaInfo = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        lead.visa = { ...lead.visa, ...req.body };
        
        // Update status if needed
        if (lead.status === 'documentation') lead.status = 'visa_process';
        
        lead.notes.push({
            note: `Visa information updated: Visa Type - ${req.body.visaType || 'Not specified'}`,
            createdBy: req.user._id,
            noteType: 'general',
            createdAt: new Date()
        });
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Visa information updated", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update documentation
export const updateDocumentation = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        lead.documentation = { ...lead.documentation, ...req.body };
        
        lead.notes.push({
            note: `Documentation updated`,
            createdBy: req.user._id,
            noteType: 'general',
            createdAt: new Date()
        });
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Documentation updated", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add document to lead
export const addDocument = async (req, res) => {
    try {
        const { documentName, notes } = req.body;
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        if (!lead.documentation) lead.documentation = { documentsReceived: [], documentsPending: [] };
        
        lead.documentation.documentsReceived.push({
            documentName,
            receivedDate: new Date(),
            verified: false,
            notes
        });
        
        // Remove from pending if exists
        const pendingIndex = lead.documentation.documentsPending.indexOf(documentName);
        if (pendingIndex > -1) {
            lead.documentation.documentsPending.splice(pendingIndex, 1);
        }
        
        lead.notes.push({
            note: `Document added: ${documentName}`,
            createdBy: req.user._id,
            noteType: 'general',
            createdAt: new Date()
        });
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Document added successfully", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add communication record
export const addCommunication = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        const communication = {
            ...req.body,
            conductedBy: req.user._id,
            date: new Date()
        };
        
        if (!lead.communications) lead.communications = [];
        lead.communications.push(communication);
        lead.lastContactedAt = new Date();
        
        if (communication.followUpNeeded && communication.followUpDate) {
            lead.notes.push({
                note: `Follow-up scheduled for ${new Date(communication.followUpDate).toLocaleDateString()}`,
                createdBy: req.user._id,
                noteType: 'follow_up',
                createdAt: new Date()
            });
        }
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Communication recorded", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add payment
export const addPayment = async (req, res) => {
    try {
        const { amount, method, receiptNumber, notes } = req.body;
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        if (!lead.financial) {
            lead.financial = { serviceFee: 0, paidAmount: 0, payments: [] };
        }
        
        lead.financial.payments.push({
            amount,
            date: new Date(),
            method,
            receiptNumber,
            notes
        });
        
        lead.financial.paidAmount += amount;
        
        if (lead.financial.paidAmount >= lead.financial.serviceFee) {
            lead.financial.paymentStatus = 'paid';
        } else if (lead.financial.paidAmount > 0) {
            lead.financial.paymentStatus = 'partial';
        }
        
        lead.notes.push({
            note: `Payment received: $${amount} via ${method}`,
            createdBy: req.user._id,
            noteType: 'general',
            createdAt: new Date()
        });
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Payment recorded", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add custom field
export const addCustomField = async (req, res) => {
    try {
        const { fieldName, fieldValue } = req.body;
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        if (!lead.customFields) lead.customFields = new Map();
        lead.customFields.set(fieldName, fieldValue);
        
        lead.updatedAt = new Date();
        await lead.save();
        
        res.status(200).json({ message: "Custom field added", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Assign lead to agent
export const assignLead = async (req, res) => {
    try {
        const { assignedTo, assignedTeam } = req.body;
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        if (assignedTo) lead.assignedTo = assignedTo;
        if (assignedTeam) lead.assignedTeam = assignedTeam;
        
        lead.notes.push({
            note: `Lead assigned to ${assignedTo ? 'Agent' : 'Team'}`,
            createdBy: req.user._id,
            noteType: 'important',
            createdAt: new Date()
        });
        
        lead.updatedAt = new Date();
        await lead.save();
        res.status(200).json({ message: "Lead assigned successfully", lead });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update full lead (all sections at once)
// Update full lead (all sections at once) - FIXED VERSION
// Update full lead (all sections at once) - FIXED VERSION
// Update full lead (all sections at once) - FINAL WORKING VERSION
export const updateFullLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        const { 
            name, email, phone, country, destination, profile, message,
            status, counselling, coaching, visa
        } = req.body;
        
        // Update basic info - only if provided and not undefined
        if (name !== undefined && name !== null) lead.name = name;
        if (email !== undefined && email !== null) lead.email = email;
        if (phone !== undefined && phone !== null) lead.phone = phone;
        if (country !== undefined && country !== null) lead.country = country;
        if (destination !== undefined && destination !== null) lead.destination = destination;
        if (profile !== undefined && profile !== null) lead.profile = profile;
        if (message !== undefined && message !== null) lead.message = message;
        
        // Update status if provided
        if (status !== undefined && status !== null) lead.status = status;
        
        // Update counselling - only if object has properties
        if (counselling !== undefined && counselling !== null && Object.keys(counselling).length > 0) {
            // Remove undefined values
            Object.keys(counselling).forEach(key => {
                if (counselling[key] === undefined || counselling[key] === null) {
                    delete counselling[key];
                }
            });
            // Only update if there are properties left
            if (Object.keys(counselling).length > 0) {
                lead.counselling = { ...(lead.counselling || {}), ...counselling };
            }
        }
        
        // Update coaching - only if object has properties
        if (coaching !== undefined && coaching !== null && Object.keys(coaching).length > 0) {
            // Remove undefined values
            Object.keys(coaching).forEach(key => {
                if (coaching[key] === undefined || coaching[key] === null) {
                    delete coaching[key];
                }
            });
            // Only update if there are properties left
            if (Object.keys(coaching).length > 0) {
                lead.coaching = { ...(lead.coaching || {}), ...coaching };
            }
        }
        
        // IMPORTANT: Handle visa update carefully - DON'T overwrite entire visa object
        if (visa !== undefined && visa !== null && Object.keys(visa).length > 0) {
            // Update each field individually without overwriting nested objects
            for (const [key, value] of Object.entries(visa)) {
                if (value !== undefined && value !== null) {
                    // Handle nested objects
                    if (key === 'financialDocuments' && typeof value === 'object') {
                        lead.visa.financialDocuments = { ...(lead.visa.financialDocuments || {}), ...value };
                    } 
                    else if (key === 'passportDetails' && typeof value === 'object') {
                        lead.visa.passportDetails = { ...(lead.visa.passportDetails || {}), ...value };
                    }
                    else if (key === 'medicalExam' && typeof value === 'object') {
                        lead.visa.medicalExam = { ...(lead.visa.medicalExam || {}), ...value };
                    }
                    else if (key === 'previousVisaHistory' && Array.isArray(value)) {
                        lead.visa.previousVisaHistory = value;
                    }
                    else {
                        // Simple field
                        lead.visa[key] = value;
                    }
                }
            }
        }
        
        // Add note about update
        if (!lead.notes) lead.notes = [];
        lead.notes.push({
            note: `Lead information updated by ${req.user.name || req.user.email}`,
            createdBy: req.user._id,
            noteType: 'important',
            createdAt: new Date()
        });
        
        lead.updatedAt = new Date();
        await lead.save();
        
        // Return the updated lead
        const updatedLead = await Lead.findById(req.params.id)
            .populate('assignedTo', 'name email role')
            .populate('notes.createdBy', 'name');
        
        res.status(200).json({ 
            message: "Lead updated successfully", 
            lead: updatedLead 
        });
    } catch (error) {
        console.error('Full lead update error:', error);
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
// Delete lead
export const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        
        res.status(200).json({ message: "Lead deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get lead statistics/dashboard data
export const getLeadStats = async (req, res) => {
    try {
        const matchQuery = req.user.role === 'agent' ? { assignedTo: req.user._id } : {};
        
        const stats = await Lead.aggregate([
            { $match: matchQuery },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]);
        
        const totalLeads = await Lead.countDocuments(matchQuery);
        const recentLeads = await Lead.find(matchQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('assignedTo', 'name');
            
        const revenue = await Lead.aggregate([
            { $match: matchQuery },
            { $group: {
                _id: null,
                totalServiceFee: { $sum: '$financial.serviceFee' },
                totalPaid: { $sum: '$financial.paidAmount' },
                pendingAmount: { $sum: { $subtract: ['$financial.serviceFee', '$financial.paidAmount'] } }
            }}
        ]);
        
        res.status(200).json({
            statusDistribution: stats,
            totalLeads,
            recentLeads,
            revenue: revenue[0] || { totalServiceFee: 0, totalPaid: 0, pendingAmount: 0 }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};