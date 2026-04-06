// controllers/dashboardController.js
import Lead from '../model/Lead.js';
import User from '../model/User.js';
import mongoose from 'mongoose';

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Admin, Agent
export const getDashboardStats = async (req, res) => {
    try {
        const matchQuery = req.user.role === 'agent' ? { assignedTo: req.user._id } : {};
        
        // Get current date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        
        // Parallel queries for better performance
        const [
            totalLeads,
            leadsThisMonth,
            leadsLastMonth,
            statusDistribution,
            visaTypeDistribution,
            countryDistribution,
            monthlyTrends,
            recentLeads,
            upcomingFollowups,
            revenueStats,
            userStats,
            performanceMetrics
        ] = await Promise.all([
            // Total leads count
            Lead.countDocuments(matchQuery),
            
            // Leads this month
            Lead.countDocuments({ ...matchQuery, createdAt: { $gte: startOfMonth } }),
            
            // Leads last month
            Lead.countDocuments({ ...matchQuery, createdAt: { $gte: lastMonth, $lt: startOfMonth } }),
            
            // Status distribution
            Lead.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            
            // Visa type distribution
            Lead.aggregate([
                { $match: { ...matchQuery, 'visa.visaType': { $ne: '' } } },
                { $group: { _id: '$visa.visaType', count: { $sum: 1 } } }
            ]),
            
            // Country/Destination distribution
            Lead.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$destination', count: { $sum: 1 } } }
            ]),
            
            // Monthly trends (last 6 months)
            Lead.aggregate([
                { $match: { ...matchQuery, createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            
            // Recent leads with details
            Lead.find(matchQuery)
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('assignedTo', 'name email')
                .select('name email destination status visa.visaType application.universityName createdAt'),
            
            // Upcoming follow-ups
            Lead.aggregate([
                { $match: { ...matchQuery, 'communications.followUpDate': { $gte: new Date() } } },
                { $unwind: '$communications' },
                { $match: { 'communications.followUpNeeded': true, 'communications.followUpDate': { $gte: new Date() } } },
                { $sort: { 'communications.followUpDate': 1 } },
                { $limit: 10 },
                {
                    $project: {
                        name: 1,
                        email: 1,
                        phone: 1,
                        followUpDate: '$communications.followUpDate',
                        followUpSummary: '$communications.summary',
                        assignedTo: 1
                    }
                }
            ]),
            
            // Revenue statistics
            Lead.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalServiceFee: { $sum: '$financial.serviceFee' },
                        totalPaid: { $sum: '$financial.paidAmount' },
                        pendingAmount: { $sum: { $subtract: ['$financial.serviceFee', '$financial.paidAmount'] } },
                        averageServiceFee: { $avg: '$financial.serviceFee' }
                    }
                }
            ]),
            
            // User/Agent statistics (admin only)
            req.user.role === 'admin' ? User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 },
                        activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
                    }
                }
            ]) : Promise.resolve([]),
            
            // Performance metrics
            Lead.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        avgConversionTime: {
                            $avg: {
                                $cond: [
                                    { $and: ['$closedAt', { $ne: ['$closedAt', null] }] },
                                    { $subtract: ['$closedAt', '$createdAt'] },
                                    null
                                ]
                            }
                        },
                        approvalRate: {
                            $avg: {
                                $cond: [
                                    { $eq: ['$visa.decision', 'approved'] },
                                    100,
                                    0
                                ]
                            }
                        },
                        totalApproved: { $sum: { $cond: [{ $eq: ['$visa.decision', 'approved'] }, 1, 0] } },
                        totalRejected: { $sum: { $cond: [{ $eq: ['$visa.decision', 'rejected'] }, 1, 0] } },
                        totalPending: { $sum: { $cond: [{ $eq: ['$visa.decision', 'pending'] }, 1, 0] } }
                    }
                }
            ])
        ]);
        
        // Calculate growth percentages
        const leadGrowth = leadsLastMonth > 0 
            ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth * 100).toFixed(1)
            : leadsThisMonth > 0 ? 100 : 0;
        
        // Format status distribution
        const statusMap = {};
        statusDistribution.forEach(item => { statusMap[item._id] = item.count; });
        
        // Format visa type distribution
        const visaTypeMap = {};
        visaTypeDistribution.forEach(item => { visaTypeMap[item._id] = item.count; });
        
        // Format country distribution
        const countryMap = {};
        countryDistribution.forEach(item => { countryMap[item._id] = item.count; });
        
        // Format monthly trends
        const monthlyData = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = { year: date.getFullYear(), month: date.getMonth() + 1 };
            const trend = monthlyTrends.find(t => t._id.year === monthKey.year && t._id.month === monthKey.month);
            monthlyData.push({
                month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
                count: trend ? trend.count : 0
            });
        }
        
        // Format recent leads for dashboard
        const formattedRecentLeads = recentLeads.map(lead => ({
            id: lead._id,
            name: lead.name,
            email: lead.email,
            destination: lead.destination,
            status: lead.status,
            visaType: lead.visa?.visaType || 'Not specified',
            university: lead.application?.universityName || 'N/A',
            date: lead.createdAt
        }));
        
        // Calculate conversion funnel
        const funnelData = {
            new: statusMap.new || 0,
            contacted: statusMap.contacted || 0,
            counselling: statusMap.counselling || 0,
            coaching: statusMap.coaching || 0,
            documentation: statusMap.documentation || 0,
            visa_process: statusMap.visa_process || 0,
            visa_granted: statusMap.visa_granted || 0,
            converted: statusMap.converted || 0,
            lost: statusMap.lost || 0
        };
        
        // Calculate conversion rates
        const conversionRates = {
            toCounselling: funnelData.new > 0 ? ((funnelData.counselling / funnelData.new) * 100).toFixed(1) : 0,
            toCoaching: funnelData.counselling > 0 ? ((funnelData.coaching / funnelData.counselling) * 100).toFixed(1) : 0,
            toVisa: funnelData.documentation > 0 ? ((funnelData.visa_process / funnelData.documentation) * 100).toFixed(1) : 0,
            toApproval: funnelData.visa_process > 0 ? ((funnelData.visa_granted / funnelData.visa_process) * 100).toFixed(1) : 0,
            overall: funnelData.new > 0 ? ((funnelData.converted / funnelData.new) * 100).toFixed(1) : 0
        };
        
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalLeads,
                    leadsThisMonth,
                    leadsLastMonth,
                    leadGrowth: parseFloat(leadGrowth),
                    activeApplications: statusMap.visa_process || 0,
                    approvedVisa: performanceMetrics[0]?.totalApproved || 0,
                    approvalRate: performanceMetrics[0]?.approvalRate?.toFixed(1) || 0,
                    pendingVisa: performanceMetrics[0]?.totalPending || 0
                },
                revenue: revenueStats[0] || {
                    totalServiceFee: 0,
                    totalPaid: 0,
                    pendingAmount: 0,
                    averageServiceFee: 0
                },
                statusDistribution: statusMap,
                visaTypeDistribution: visaTypeMap,
                countryDistribution: countryMap,
                monthlyTrends: monthlyData,
                recentLeads: formattedRecentLeads,
                upcomingFollowups: upcomingFollowups,
                funnelData,
                conversionRates,
                performance: performanceMetrics[0] || {
                    avgConversionTime: 0,
                    approvalRate: 0,
                    totalApproved: 0,
                    totalRejected: 0,
                    totalPending: 0
                },
                users: req.user.role === 'admin' ? userStats : null,
                lastUpdated: new Date()
            }
        });
        
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// @desc    Get agent performance metrics
// @route   GET /api/dashboard/agent-performance
// @access  Admin only
export const getAgentPerformance = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        const agentPerformance = await Lead.aggregate([
            {
                $match: { assignedTo: { $ne: null } }
            },
            {
                $group: {
                    _id: '$assignedTo',
                    totalLeads: { $sum: 1 },
                    convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
                    approvedVisa: { $sum: { $cond: [{ $eq: ['$visa.decision', 'approved'] }, 1, 0] } },
                    totalRevenue: { $sum: '$financial.paidAmount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agent'
                }
            },
            {
                $unwind: '$agent'
            },
            {
                $project: {
                    agentId: '$_id',
                    agentName: '$agent.name',
                    agentEmail: '$agent.email',
                    agentRole: '$agent.role',
                    totalLeads: 1,
                    convertedLeads: 1,
                    conversionRate: {
                        $multiply: [
                            { $divide: ['$convertedLeads', { $max: ['$totalLeads', 1] }] },
                            100
                        ]
                    },
                    approvedVisa: 1,
                    approvalRate: {
                        $multiply: [
                            { $divide: ['$approvedVisa', { $max: ['$totalLeads', 1] }] },
                            100
                        ]
                    },
                    totalRevenue: 1,
                    avgRevenuePerLead: {
                        $divide: ['$totalRevenue', { $max: ['$totalLeads', 1] }]
                    }
                }
            },
            { $sort: { totalLeads: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            data: agentPerformance
        });
        
    } catch (error) {
        console.error('Agent performance error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// @desc    Get detailed lead analytics
// @route   GET /api/dashboard/lead-analytics
// @access  Admin, Agent
export const getLeadAnalytics = async (req, res) => {
    try {
        const matchQuery = req.user.role === 'agent' ? { assignedTo: req.user._id } : {};
        const { period = 'month' } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        switch(period) {
            case 'week':
                dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
                break;
            case 'month':
                dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
                break;
            case 'quarter':
                dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 3)) };
                break;
            case 'year':
                dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
                break;
            default:
                dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        }
        
        const [
            leadsBySource,
            averageProcessingTime,
            visaSuccessByCountry,
            monthlyRevenue,
            topPerformingAgents
        ] = await Promise.all([
            // Leads by profile/source
            Lead.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$profile', count: { $sum: 1 } } }
            ]),
            
            // Average processing time by visa type
            Lead.aggregate([
                { $match: { ...matchQuery, 'visa.decisionDate': { $ne: null }, 'visa.appliedDate': { $ne: null } } },
                {
                    $group: {
                        _id: '$visa.visaType',
                        avgDays: {
                            $avg: {
                                $divide: [
                                    { $subtract: ['$visa.decisionDate', '$visa.appliedDate'] },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]),
            
            // Visa success rate by country
            Lead.aggregate([
                { $match: { ...matchQuery, 'visa.decision': { $in: ['approved', 'rejected'] } } },
                {
                    $group: {
                        _id: {
                            country: '$destination',
                            decision: '$visa.decision'
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.country',
                        approved: { $sum: { $cond: [{ $eq: ['$_id.decision', 'approved'] }, '$count', 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ['$_id.decision', 'rejected'] }, '$count', 0] } },
                        total: { $sum: '$count' }
                    }
                },
                {
                    $project: {
                        country: '$_id',
                        approved: 1,
                        rejected: 1,
                        total: 1,
                        successRate: {
                            $multiply: [{ $divide: ['$approved', { $max: ['$total', 1] }] }, 100]
                        }
                    }
                },
                { $sort: { total: -1 } },
                { $limit: 10 }
            ]),
            
            // Monthly revenue trend
            Lead.aggregate([
                { $match: { ...matchQuery, 'financial.paidAmount': { $gt: 0 } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        revenue: { $sum: '$financial.paidAmount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
                { $limit: 12 }
            ]),
            
            // Top performing agents (admin only)
            req.user.role === 'admin' ? Lead.aggregate([
                { $match: { assignedTo: { $ne: null } } },
                {
                    $group: {
                        _id: '$assignedTo',
                        totalLeads: { $sum: 1 },
                        converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
                        approved: { $sum: { $cond: [{ $eq: ['$visa.decision', 'approved'] }, 1, 0] } }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'agent'
                    }
                },
                { $unwind: '$agent' },
                {
                    $project: {
                        name: '$agent.name',
                        totalLeads: 1,
                        conversionRate: {
                            $multiply: [{ $divide: ['$converted', { $max: ['$totalLeads', 1] }] }, 100]
                        },
                        approvalRate: {
                            $multiply: [{ $divide: ['$approved', { $max: ['$totalLeads', 1] }] }, 100]
                        }
                    }
                },
                { $sort: { totalLeads: -1 } },
                { $limit: 5 }
            ]) : Promise.resolve([])
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                leadsBySource,
                averageProcessingTime,
                visaSuccessByCountry,
                monthlyRevenue,
                topPerformingAgents: req.user.role === 'admin' ? topPerformingAgents : null,
                period
            }
        });
        
    } catch (error) {
        console.error('Lead analytics error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// @desc    Get real-time notifications/activities
// @route   GET /api/dashboard/activities
// @access  Admin, Agent
export const getRecentActivities = async (req, res) => {
    try {
        const matchQuery = req.user.role === 'agent' ? { assignedTo: req.user._id } : {};
        
        const activities = await Lead.aggregate([
            { $match: matchQuery },
            { $sort: { updatedAt: -1 } },
            { $limit: 20 },
            {
                $project: {
                    leadId: '$_id',
                    leadName: '$name',
                    leadEmail: '$email',
                    status: '$status',
                    visaDecision: '$visa.decision',
                    updatedAt: 1,
                    lastCommunication: { $arrayElemAt: ['$communications', -1] }
                }
            }
        ]);
        
        const formattedActivities = activities.map(activity => ({
            id: activity.leadId,
            leadName: activity.leadName,
            leadEmail: activity.leadEmail,
            type: activity.visaDecision === 'approved' ? 'visa_approved' : 
                  activity.visaDecision === 'rejected' ? 'visa_rejected' :
                  activity.status === 'converted' ? 'lead_converted' : 'status_updated',
            message: `${activity.leadName} - Status: ${activity.status}${activity.visaDecision ? `, Visa: ${activity.visaDecision}` : ''}`,
            timestamp: activity.updatedAt,
            details: activity.lastCommunication
        }));
        
        res.status(200).json({
            success: true,
            data: formattedActivities
        });
        
    } catch (error) {
        console.error('Activities error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};