// Wisdom Connect - Express Server for Railway Deployment
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database (in production, use a real database)
const database = {
    experts: [
        {
            id: 1,
            name: "Dr. Sarah Chen",
            industry: "Technology & AI",
            avatar: "👩‍💻",
            experience: "Former VP at Google & Microsoft",
            rating: 4.9,
            reviews: 127,
            price: 3000,
            projects: 89,
            skills: ["AI Strategy", "Digital Transformation", "Product Management"],
            description: "Leading AI strategist with 25+ years in tech. Helped 50+ companies implement successful AI initiatives.",
            title: "Former VP of AI at Google",
            experienceLevel: "veteran",
            linkedin: "https://linkedin.com/in/sarah-chen-ai",
            availability: "part-time",
            bio: "Led AI initiatives at Google and Microsoft for over 25 years. Specialized in enterprise AI transformation and strategic implementation.",
            isActive: true,
            joinedDate: new Date().toISOString()
        },
        {
            id: 2,
            name: "Robert Williams",
            industry: "Manufacturing",
            avatar: "👨‍🏭",
            experience: "Ex-Director at General Electric",
            rating: 4.8,
            reviews: 203,
            price: 2200,
            projects: 156,
            skills: ["Lean Manufacturing", "Operations Excellence", "Supply Chain"],
            description: "Manufacturing excellence expert with 30+ years at Fortune 500 companies.",
            title: "Former Director of Operations at GE",
            experienceLevel: "executive",
            linkedin: "https://linkedin.com/in/robert-williams-mfg",
            availability: "full-time",
            bio: "30+ years optimizing manufacturing processes at Fortune 500 companies. Expert in lean methodologies and supply chain optimization.",
            isActive: true,
            joinedDate: new Date().toISOString()
        },
        {
            id: 3,
            name: "Dr. James Mitchell",
            industry: "Healthcare & Pharma",
            avatar: "👨‍⚕️",
            experience: "40 years at Pfizer & J&J",
            rating: 4.9,
            reviews: 89,
            price: 2800,
            projects: 67,
            skills: ["Drug Development", "Regulatory Affairs", "Clinical Trials"],
            description: "Pharmaceutical industry veteran. Led development of 15+ successful drugs.",
            title: "Former Chief Medical Officer at Pfizer",
            experienceLevel: "veteran",
            linkedin: "https://linkedin.com/in/james-mitchell-pharma",
            availability: "advisory",
            bio: "40 years in pharmaceutical development. Led clinical trials for 15+ FDA-approved medications at Pfizer and J&J.",
            isActive: true,
            joinedDate: new Date().toISOString()
        },
        {
            id: 4,
            name: "Maria Rodriguez",
            industry: "Finance & Banking",
            avatar: "👩‍💼",
            experience: "Former CFO at Goldman Sachs",
            rating: 4.9,
            reviews: 145,
            price: 3500,
            projects: 78,
            skills: ["Investment Strategy", "Risk Management", "M&A"],
            description: "Wall Street veteran with expertise in complex financial instruments.",
            title: "Former CFO at Goldman Sachs",
            experienceLevel: "executive",
            linkedin: "https://linkedin.com/in/maria-rodriguez-gs",
            availability: "project-based",
            bio: "Former CFO at Goldman Sachs with 20+ years in investment banking. Specialized in M&A transactions and risk management.",
            isActive: true,
            joinedDate: new Date().toISOString()
        }
    ],
    expertApplications: [],
    clientFeedback: [],
    expertFeedback: [],
    connections: []
};

// Save database to file (optional - for persistence between restarts)
async function saveDatabase() {
    try {
        await fs.writeFile('database.json', JSON.stringify(database, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

// Load database from file (optional - for persistence between restarts)
async function loadDatabase() {
    try {
        const data = await fs.readFile('database.json', 'utf8');
        Object.assign(database, JSON.parse(data));
        console.log('📂 Database loaded from file');
    } catch (error) {
        console.log('📂 Using default database (file not found)');
    }
}

// Security and performance middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://www.googletagmanager.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://www.google-analytics.com"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Initialize database on startup
loadDatabase();

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Dynamic API endpoints for experts
app.get('/api/experts', (req, res) => {
    const { industry, experience, budget, keywords } = req.query;
    
    let filteredExperts = database.experts.filter(expert => expert.isActive);
    
    // Filter by industry
    if (industry) {
        filteredExperts = filteredExperts.filter(expert => 
            expert.industry.toLowerCase().includes(industry.toLowerCase())
        );
    }
    
    // Filter by experience level
    if (experience) {
        filteredExperts = filteredExperts.filter(expert => 
            expert.experienceLevel === experience
        );
    }
    
    // Filter by budget
    if (budget) {
        const [min, max] = budget.split('-').map(b => parseInt(b) || Infinity);
        filteredExperts = filteredExperts.filter(expert => 
            expert.price >= min && (max === Infinity || expert.price <= max)
        );
    }
    
    // Filter by keywords in skills
    if (keywords) {
        const keywordLower = keywords.toLowerCase();
        filteredExperts = filteredExperts.filter(expert => 
            expert.skills.some(skill => skill.toLowerCase().includes(keywordLower)) ||
            expert.name.toLowerCase().includes(keywordLower) ||
            expert.description.toLowerCase().includes(keywordLower)
        );
    }
    
    console.log(`🔍 Expert search: ${filteredExperts.length} results for filters:`, { industry, experience, budget, keywords });
    
    res.json({
        success: true,
        experts: filteredExperts,
        total: filteredExperts.length,
        timestamp: new Date().toISOString()
    });
});

// Get single expert by ID
app.get('/api/experts/:id', (req, res) => {
    const expertId = parseInt(req.params.id);
    const expert = database.experts.find(e => e.id === expertId && e.isActive);
    
    if (!expert) {
        return res.status(404).json({
            success: false,
            error: 'Expert not found'
        });
    }
    
    res.json({
        success: true,
        expert: expert
    });
});

// Get all expert applications (admin endpoint)
app.get('/api/admin/applications', (req, res) => {
    res.json({
        success: true,
        applications: database.expertApplications,
        total: database.expertApplications.length
    });
});

// Get all feedback (admin endpoint)
app.get('/api/admin/feedback', (req, res) => {
    res.json({
        success: true,
        clientFeedback: database.clientFeedback,
        expertFeedback: database.expertFeedback,
        totalClient: database.clientFeedback.length,
        totalExpert: database.expertFeedback.length
    });
});

// Get platform stats
app.get('/api/stats', (req, res) => {
    const stats = {
        totalExperts: database.experts.filter(e => e.isActive).length,
        totalApplications: database.expertApplications.length,
        totalConnections: database.connections.length,
        totalFeedback: database.clientFeedback.length + database.expertFeedback.length,
        averageRating: database.experts.length > 0 
            ? (database.experts.reduce((sum, expert) => sum + expert.rating, 0) / database.experts.length).toFixed(1)
            : 0,
        industries: [...new Set(database.experts.map(e => e.industry))],
        topSkills: database.experts.reduce((skills, expert) => {
            expert.skills.forEach(skill => {
                skills[skill] = (skills[skill] || 0) + 1;
            });
            return skills;
        }, {})
    };
    
    res.json({
        success: true,
        stats: stats,
        timestamp: new Date().toISOString()
    });
});

// API endpoints for feedback collection
app.post('/api/feedback/client', (req, res) => {
    const feedbackData = {
        id: Date.now(),
        ...req.body,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
    };
    
    console.log('🎯 Client Feedback Received:', feedbackData);
    
    // Validate required fields
    if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({ 
            success: false, 
            error: 'Valid rating (1-5) is required' 
        });
    }
    
    // Store in database
    database.clientFeedback.push(feedbackData);
    saveDatabase(); // Persist to file
    
    res.json({ 
        success: true, 
        message: 'Thank you for your feedback! 🎉',
        feedbackId: feedbackData.id,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/feedback/expert', (req, res) => {
    const feedbackData = {
        id: Date.now(),
        ...req.body,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
    };
    
    console.log('🎓 Expert Feedback Received:', feedbackData);
    
    // Validate required fields
    if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({ 
            success: false, 
            error: 'Valid rating (1-5) is required' 
        });
    }
    
    // Store in database
    database.expertFeedback.push(feedbackData);
    saveDatabase(); // Persist to file
    
    res.json({ 
        success: true, 
        message: 'Your expert insights are invaluable! 🙏',
        feedbackId: feedbackData.id,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/expert/application', (req, res) => {
    const applicationData = {
        id: Date.now(),
        applicationId: 'WC_' + Date.now().toString(36).toUpperCase(),
        ...req.body,
        status: 'pending',
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        submittedDate: new Date().toISOString(),
        timestamp: new Date().toISOString()
    };
    
    console.log('👤 Expert Application Received:', applicationData);
    
    // Validate required fields
    const requiredFields = ['name', 'title', 'experience', 'industry', 'rate'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
        return res.status(400).json({ 
            success: false, 
            error: `Missing required fields: ${missingFields.join(', ')}` 
        });
    }
    
    // Validate rate
    if (req.body.rate < 1000 || req.body.rate > 10000) {
        return res.status(400).json({ 
            success: false, 
            error: 'Daily rate must be between $1,000 and $10,000' 
        });
    }
    
    // Store in database
    database.expertApplications.push(applicationData);
    saveDatabase(); // Persist to file
    
    res.json({ 
        success: true, 
        message: 'Application submitted successfully! 🎯',
        applicationId: applicationData.applicationId,
        estimatedReviewTime: '48 hours',
        timestamp: new Date().toISOString()
    });
});

// Approve expert application (admin endpoint)
app.post('/api/admin/applications/:id/approve', (req, res) => {
    const applicationId = parseInt(req.params.id);
    const application = database.expertApplications.find(app => app.id === applicationId);
    
    if (!application) {
        return res.status(404).json({
            success: false,
            error: 'Application not found'
        });
    }
    
    if (application.status !== 'pending') {
        return res.status(400).json({
            success: false,
            error: 'Application already processed'
        });
    }
    
    // Create new expert from application
    const newExpertId = Math.max(...database.experts.map(e => e.id)) + 1;
    const newExpert = {
        id: newExpertId,
        name: application.name,
        title: application.title,
        industry: application.industry,
        avatar: "👤", // Default avatar
        experience: `${application.experience} years experience`,
        rating: 5.0, // Start with perfect rating
        reviews: 0,
        price: parseInt(application.rate),
        projects: 0,
        skills: application.skills || [],
        description: application.bio || `Experienced professional in ${application.industry}`,
        experienceLevel: application.experience,
        linkedin: application.linkedin || '',
        availability: application.availability || 'part-time',
        bio: application.bio || '',
        isActive: true,
        joinedDate: new Date().toISOString(),
        approvedDate: new Date().toISOString()
    };
    
    // Add to experts
    database.experts.push(newExpert);
    
    // Update application status
    application.status = 'approved';
    application.approvedDate = new Date().toISOString();
    application.expertId = newExpertId;
    
    saveDatabase(); // Persist to file
    
    res.json({
        success: true,
        message: 'Application approved successfully! 🎉',
        expert: newExpert,
        application: application
    });
});

// Waitlist endpoint for viral launch
app.post('/api/waitlist', (req, res) => {
    const waitlistData = {
        id: Date.now(),
        waitlistId: 'WL_' + Date.now().toString(36).toUpperCase(),
        ...req.body,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString(),
        source: req.body.source || 'website'
    };
    
    console.log('🚀 VIRAL WAITLIST SIGNUP:', waitlistData);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
        return res.status(400).json({ 
            success: false, 
            error: `Missing required fields: ${missingFields.join(', ')}` 
        });
    }
    
    // Validate email
    if (!req.body.email.includes('@') || !req.body.email.includes('.')) {
        return res.status(400).json({ 
            success: false, 
            error: 'Valid email address is required' 
        });
    }
    
    // Store in database (you could also integrate with Mailchimp, ConvertKit, etc.)
    if (!database.waitlist) {
        database.waitlist = [];
    }
    database.waitlist.push(waitlistData);
    saveDatabase(); // Persist to file
    
    // Calculate position (add some randomness for psychology)
    const position = database.waitlist.length + Math.floor(Math.random() * 100) + 150;
    
    res.json({ 
        success: true, 
        message: 'Welcome to the revolution! 🚀',
        waitlistId: waitlistData.waitlistId,
        position: position,
        estimatedLaunch: '30 days',
        timestamp: new Date().toISOString()
    });
});

// Get waitlist stats (for social proof)
app.get('/api/waitlist/stats', (req, res) => {
    const stats = {
        totalSignups: database.waitlist ? database.waitlist.length + 247 : 247, // Add base number for social proof
        todaySignups: Math.floor(Math.random() * 50) + 20,
        topCountries: ['🇺🇸 United States', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇦🇺 Australia', '🇩🇪 Germany'],
        recentExperts: ['Elon Musk', 'Warren Buffett', 'Steve Jobs', 'Jeff Bezos', 'Oprah Winfrey'],
        launchProgress: 73 // Percentage
    };
    
    res.json({
        success: true,
        stats: stats,
        timestamp: new Date().toISOString()
    });
});

// Expert connection endpoint
app.post('/api/expert/connect', (req, res) => {
    const connectionData = {
        id: Date.now(),
        connectionId: 'CONN_' + Date.now().toString(36).toUpperCase(),
        ...req.body,
        status: 'pending',
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
    };
    
    console.log('🤝 Expert Connection Request:', connectionData);
    
    const { expertId } = req.body;
    
    if (!expertId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Expert ID is required' 
        });
    }
    
    // Verify expert exists
    const expert = database.experts.find(e => e.id === expertId && e.isActive);
    if (!expert) {
        return res.status(404).json({
            success: false,
            error: 'Expert not found'
        });
    }
    
    // Store connection request
    database.connections.push(connectionData);
    saveDatabase(); // Persist to file
    
    res.json({
        success: true,
        message: 'Connection request sent successfully! 💫',
        connectionId: connectionData.connectionId,
        expert: {
            id: expert.id,
            name: expert.name,
            industry: expert.industry
        },
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong!' 
            : err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Wisdom Connect server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    
    // Log deployment info for Railway
    if (process.env.RAILWAY_ENVIRONMENT) {
        console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
        console.log(`🔗 Railway URL: ${process.env.RAILWAY_STATIC_URL || 'Not available'}`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
