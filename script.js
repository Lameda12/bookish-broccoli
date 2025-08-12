// Wisdom Connect - Modern JavaScript Implementation
let currentStep = 1;
let currentMode = 'client';
let selectedExpert = null;
let clientRating = 0;
let expertRating = 0;
let expertSkills = [];

// Dynamic expert data - fetched from API
let experts = [];
let allExperts = []; // Cache all experts for client-side filtering fallback

// Initialize application
window.addEventListener('DOMContentLoaded', async function() {
    createParticles();
    
    // Load initial experts from API
    await loadExperts();
    
    // Load social proof counters
    await loadSocialProof();
    
    // Allow Enter key to add skills
    const skillInput = document.getElementById('skillInput');
    if (skillInput) {
        skillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
            }
        });
    }
    
    // Clean design - no interactive background needed
});

// Load experts from API
async function loadExperts() {
    try {
        const response = await fetch('/api/experts');
        const result = await response.json();
        
        if (result.success) {
            experts = result.experts;
            allExperts = [...result.experts]; // Cache for fallback
            displayExperts(experts);
            console.log(`📊 Loaded ${experts.length} experts from API`);
        } else {
            console.error('Failed to load experts:', result.error);
            showError('Failed to load experts. Please try again.');
        }
    } catch (error) {
        console.error('Error loading experts:', error);
        showError('Network error loading experts. Please check your connection.');
    }
}

// Create floating particles (simplified for clean design)
function createParticles() {
    // Particles removed for cleaner design
    return;
}

// Mode switching functionality
function switchMode(mode) {
    currentMode = mode;
    
    // Update mode buttons
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-primary-500', 'to-primary-600', 'text-white');
        btn.classList.add('text-white/70', 'hover:text-white');
    });
    
    // Highlight active button
    event.target.classList.remove('text-white/70', 'hover:text-white');
    event.target.classList.add('bg-gradient-to-r', 'from-primary-500', 'to-primary-600', 'text-white');
    
    // Switch views
    const clientView = document.getElementById('clientView');
    const expertView = document.getElementById('expertView');
    
    if (mode === 'client') {
        clientView.classList.remove('hidden');
        expertView.classList.add('hidden');
    } else {
        clientView.classList.add('hidden');
        expertView.classList.remove('hidden');
    }
}

// Expert search functionality - now with API calls
async function searchExperts() {
    const industry = document.getElementById('industry-filter')?.value || '';
    const experience = document.getElementById('experience-filter')?.value || '';
    const budget = document.getElementById('budget-filter')?.value || '';
    const keywords = document.getElementById('keywords')?.value || '';

    // Show loading state
    const searchButton = document.querySelector('[onclick="searchExperts()"]');
    if (searchButton) {
        showLoadingState(searchButton, true);
    }

    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (industry) params.append('industry', industry);
        if (experience) params.append('experience', experience);
        if (budget) params.append('budget', budget);
        if (keywords) params.append('keywords', keywords);

        const response = await fetch(`/api/experts?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
            experts = result.experts;
            displayExperts(experts);
            console.log(`🔍 Search returned ${experts.length} experts`);
            
            // Show message if no results
            if (experts.length === 0) {
                const grid = document.getElementById('expertsGrid');
                if (grid) {
                    grid.innerHTML = `
                        <div class="col-span-full text-center py-12">
                            <div class="glass-card rounded-2xl p-8 text-white/90">
                                <div class="text-6xl mb-4">🔍</div>
                                <h3 class="text-xl font-bold mb-2">No experts found</h3>
                                <p class="text-white/70">Try adjusting your search criteria or browse all experts.</p>
                                <button onclick="clearFilters()" class="mt-4 bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-2 rounded-lg text-white font-medium hover:scale-105 transition-all">
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            console.error('Search failed:', result.error);
            showError('Search failed. Please try again.');
            
            // Fallback to local filtering
            displayExperts(allExperts);
        }
    } catch (error) {
        console.error('Error searching experts:', error);
        showError('Search error. Showing all experts.');
        
        // Fallback to local filtering
        const filteredExperts = allExperts.filter(expert => {
            if (industry && !expert.industry.toLowerCase().includes(industry.toLowerCase())) return false;
            if (budget) {
                const [min, max] = budget.split('-').map(b => parseInt(b) || Infinity);
                if (expert.price < min || expert.price > max) return false;
            }
            if (keywords && !expert.skills.some(skill => skill.toLowerCase().includes(keywords.toLowerCase()))) return false;
            return true;
        });
        displayExperts(filteredExperts);
    } finally {
        // Restore search button
        if (searchButton) {
            showLoadingState(searchButton, false);
            searchButton.innerHTML = '🎯 Find Experts';
        }
    }
}

// Clear all filters and show all experts
async function clearFilters() {
    // Reset form fields
    const industryFilter = document.getElementById('industry-filter');
    const experienceFilter = document.getElementById('experience-filter');
    const budgetFilter = document.getElementById('budget-filter');
    const keywordsInput = document.getElementById('keywords');
    
    if (industryFilter) industryFilter.value = '';
    if (experienceFilter) experienceFilter.value = '';
    if (budgetFilter) budgetFilter.value = '';
    if (keywordsInput) keywordsInput.value = '';
    
    // Reload all experts
    await loadExperts();
}

// Display expert cards
function displayExperts(expertsToShow) {
    const grid = document.getElementById('expertsGrid');
    if (!grid) return;
    
    grid.innerHTML = expertsToShow.map((expert, index) => `
        <div class="glass-card rounded-2xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer animate-float shadow-2xl" style="animation-delay: ${index * 0.1}s;" onclick="selectExpert(${expert.id})">
            <div class="flex items-center mb-6">
                <div class="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-3xl mr-5 relative animate-glow">
                    ${expert.avatar}
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-success-400 rounded-full border-3 border-white animate-pulse"></div>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-1">${expert.name}</h3>
                    <div class="text-primary-300 font-semibold text-lg">${expert.industry}</div>
                </div>
            </div>
            
            <p class="text-white/80 mb-6">${expert.experience}</p>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="text-center glass-dark rounded-xl p-4">
                    <div class="text-2xl font-bold text-primary-400 mb-1">${expert.projects}</div>
                    <div class="text-xs text-white/60">Projects</div>
                </div>
                <div class="text-center glass-dark rounded-xl p-4">
                    <div class="text-2xl font-bold text-accent-400 mb-1">${expert.reviews}</div>
                    <div class="text-xs text-white/60">Reviews</div>
                </div>
            </div>
            
            <div class="flex justify-center items-center mb-6">
                ${Array(5).fill().map((_, i) => 
                    `<span class="text-yellow-400 text-xl mr-1">${i < Math.floor(expert.rating) ? '★' : '☆'}</span>`
                ).join('')}
                <span class="ml-3 text-white/90 font-medium">${expert.rating}</span>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-6">
                ${expert.skills.map(skill => 
                    `<span class="glass-dark px-3 py-1 rounded-full text-sm text-primary-300 border border-primary-400/30">${skill}</span>`
                ).join('')}
            </div>
            
            <div class="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-4 rounded-xl text-center font-bold text-lg mb-6 animate-glow">
                $${expert.price.toLocaleString()}/day
            </div>
            
            <button class="w-full bg-gradient-to-r from-success-400 to-success-600 hover:from-success-500 hover:to-success-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl" onclick="event.stopPropagation(); connectWithExpert(${expert.id})">
                💬 Connect Now
            </button>
        </div>
    `).join('');
}

// Expert selection
function selectExpert(expertId) {
    // Remove previous selection
    document.querySelectorAll('#expertsGrid > div').forEach(card => {
        card.classList.remove('ring-2', 'ring-primary-400', 'ring-opacity-75');
    });
    
    // Add selection to current card
    event.currentTarget.classList.add('ring-2', 'ring-primary-400', 'ring-opacity-75');
    selectedExpert = experts.find(e => e.id === expertId);
}

// Connect with expert
async function connectWithExpert(expertId) {
    const expert = experts.find(e => e.id === expertId);
    
    try {
        const response = await fetch('/api/expert/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expertId: expertId,
                expertName: expert.name,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`🎉 Great choice! Connected with ${expert.name}! Connection ID: ${result.connectionId}\n\nThis demo shows the potential - help us make it reality with your feedback below!`);
            
            // Send to analytics
            trackEvent('expert_connection_initiated', {
                expertId: expertId,
                expertName: expert.name,
                connectionId: result.connectionId
            });
        } else {
            showError(result.error || 'Failed to connect with expert');
        }
    } catch (error) {
        console.error('Error connecting with expert:', error);
        showNotification(`🎉 Great choice! In the real platform, you would now be connected with ${expert.name}.\n\nThis demo shows the potential - help us make it reality with your feedback below!`);
    }
}

// Skills management
function addSkill() {
    const input = document.getElementById('skillInput');
    if (!input) return;
    
    const skill = input.value.trim();
    
    if (skill && !expertSkills.includes(skill)) {
        expertSkills.push(skill);
        input.value = '';
        updateSkillsDisplay();
    }
}

function updateSkillsDisplay() {
    const display = document.getElementById('skillsDisplay');
    if (!display) return;
    
    display.innerHTML = expertSkills.map(skill => `
        <div class="glass-dark px-4 py-2 rounded-full text-sm flex items-center gap-2 text-primary-300 border border-primary-400/30 hover:border-primary-400/50 transition-colors">
            ${skill}
            <span class="cursor-pointer font-bold hover:text-red-400 ml-1 transition-colors" onclick="removeSkill('${skill}')">×</span>
        </div>
    `).join('');
}

function removeSkill(skill) {
    expertSkills = expertSkills.filter(s => s !== skill);
    updateSkillsDisplay();
}

// Rating functionality
function setRating(rating) {
    clientRating = rating;
    const stars = document.querySelectorAll('#clientRating .rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-white/30');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-white/30');
        }
    });
}

function setExpertRating(rating) {
    expertRating = rating;
    const stars = document.querySelectorAll('#expertRating .rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-white/30');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-white/30');
        }
    });
}

// Form submissions
async function submitClientFeedback() {
    const feedback = document.getElementById('clientFeedback')?.value || '';
    const linkedin = document.getElementById('clientLinkedIn')?.value || '';
    const submitButton = document.querySelector('[onclick="submitClientFeedback()"]');
    
    if (clientRating === 0) {
        showError('Please rate your experience first!');
        return;
    }
    
    // Show loading state
    if (submitButton) {
        showLoadingState(submitButton, true);
    }
    
    const feedbackData = {
        rating: clientRating,
        feedback: feedback,
        linkedin: linkedin,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/feedback/client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            const successElement = document.getElementById('clientSuccess');
            if (successElement) {
                successElement.classList.remove('hidden');
                successElement.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Send to analytics (if integrated)
            trackEvent('client_feedback_submitted', feedbackData);
        } else {
            showError(result.error || 'Failed to submit feedback');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showError('Network error. Please try again.');
    } finally {
        // Restore button state
        if (submitButton) {
            showLoadingState(submitButton, false);
            submitButton.innerHTML = '🚀 Submit Feedback';
        }
    }
}

async function submitExpertApplication() {
    const name = document.getElementById('expertName')?.value || '';
    const title = document.getElementById('expertTitle')?.value || '';
    const experience = document.getElementById('expertExperience')?.value || '';
    const industry = document.getElementById('expertIndustry')?.value || '';
    const linkedin = document.getElementById('expertLinkedIn')?.value || '';
    const rate = document.getElementById('expertRate')?.value || '';
    const bio = document.getElementById('expertBio')?.value || '';
    const availability = document.getElementById('expertAvailability')?.value || '';
    const submitButton = document.querySelector('[onclick="submitExpertApplication()"]');
    
    if (!name || !title || !experience || !industry || !rate) {
        showError('Please fill in all required fields!');
        return;
    }
    
    // Show loading state
    if (submitButton) {
        showLoadingState(submitButton, true);
    }
    
    const applicationData = {
        name, title, experience, industry, linkedin, rate: parseInt(rate), bio, availability,
        skills: expertSkills,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/expert/application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(applicationData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            const successElement = document.getElementById('expertSuccess');
            if (successElement) {
                successElement.classList.remove('hidden');
                successElement.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Send to analytics (if integrated)
            trackEvent('expert_application_submitted', applicationData);
            
            showNotification(`Application submitted! Your ID: ${result.applicationId}`);
        } else {
            showError(result.error || 'Failed to submit application');
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        showError('Network error. Please try again.');
    } finally {
        // Restore button state
        if (submitButton) {
            showLoadingState(submitButton, false);
            submitButton.innerHTML = '🎯 Apply to Join Network';
        }
    }
}

async function submitExpertFeedback() {
    const concerns = document.getElementById('expertConcerns')?.value || '';
    const features = document.getElementById('expertFeatures')?.value || '';
    const submitButton = document.querySelector('[onclick="submitExpertFeedback()"]');
    
    if (expertRating === 0) {
        showError('Please rate the concept first!');
        return;
    }
    
    // Show loading state
    if (submitButton) {
        showLoadingState(submitButton, true);
    }
    
    const feedbackData = {
        rating: expertRating,
        concerns: concerns,
        features: features,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/feedback/expert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            const successElement = document.getElementById('expertFeedbackSuccess');
            if (successElement) {
                successElement.classList.remove('hidden');
                successElement.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Send to analytics (if integrated)
            trackEvent('expert_feedback_submitted', feedbackData);
        } else {
            showError(result.error || 'Failed to submit expert feedback');
        }
    } catch (error) {
        console.error('Error submitting expert feedback:', error);
        showError('Network error. Please try again.');
    } finally {
        // Restore button state
        if (submitButton) {
            showLoadingState(submitButton, false);
            submitButton.innerHTML = '🚀 Submit Expert Feedback';
        }
    }
}

// REVOLUTIONARY STEVE JOBS-INSPIRED FEATURES 🚀
// These create demand people don't know they have yet!

// AI Expert Brain - Think like industry legends
function activateExpertBrain() {
    const modal = createRevolutionaryModal(`
        <div class="text-center mb-6">
            <div class="text-6xl mb-4 animate-pulse">🧠</div>
            <h2 class="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                AI Expert Brain Activated
            </h2>
            <p class="text-white/80 mb-6">Choose an industry legend to simulate their thinking patterns</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="glass-dark p-4 rounded-xl cursor-pointer hover:scale-105 transition-all border border-green-400/30" onclick="loadExpertPersonality('elon')">
                <div class="text-3xl mb-2">🚀</div>
                <div class="font-bold text-green-400">Elon Musk</div>
                <div class="text-xs text-white/60">Innovation & Risk</div>
            </div>
            <div class="glass-dark p-4 rounded-xl cursor-pointer hover:scale-105 transition-all border border-blue-400/30" onclick="loadExpertPersonality('warren')">
                <div class="text-3xl mb-2">💰</div>
                <div class="font-bold text-blue-400">Warren Buffett</div>
                <div class="text-xs text-white/60">Value & Patience</div>
            </div>
            <div class="glass-dark p-4 rounded-xl cursor-pointer hover:scale-105 transition-all border border-purple-400/30" onclick="loadExpertPersonality('steve')">
                <div class="text-3xl mb-2">📱</div>
                <div class="font-bold text-purple-400">Steve Jobs</div>
                <div class="text-xs text-white/60">Vision & Design</div>
            </div>
        </div>

        <div class="bg-black/50 p-4 rounded-lg mb-6">
            <div class="text-green-400 text-sm mb-2">🔴 LIVE: Describe your business challenge...</div>
            <textarea id="expertChallenge" placeholder="e.g. Should I pivot my startup to focus on AI instead of traditional software?" 
                      class="w-full p-3 bg-transparent text-white border border-white/20 rounded-lg h-24 resize-none focus:border-green-400 outline-none"></textarea>
        </div>

        <button onclick="generateExpertAdvice()" class="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl font-bold hover:scale-105 transition-all animate-glow">
            🧠 Generate Expert DNA Response
        </button>
    `);
}

// Load different expert personalities
function loadExpertPersonality(expert) {
    const personalities = {
        elon: { name: 'Elon Musk', style: 'First principles thinking, bold risks, long-term vision', color: 'green' },
        warren: { name: 'Warren Buffett', style: 'Value investing, patience, compound growth', color: 'blue' },
        steve: { name: 'Steve Jobs', style: 'User experience, simplicity, revolutionary products', color: 'purple' }
    };
    
    const selected = personalities[expert];
    showNotification(`🎯 ${selected.name}'s thinking pattern loaded! Decision-making style: ${selected.style}`);
    
    // Visual feedback
    document.querySelectorAll('.glass-dark').forEach(card => card.classList.remove('ring-2'));
    event.target.closest('.glass-dark').classList.add('ring-2', `ring-${selected.color}-400`);
}

// Generate AI expert advice
async function generateExpertAdvice() {
    const challenge = document.getElementById('expertChallenge').value;
    if (!challenge) {
        showError('Please describe your challenge first!');
        return;
    }

    const responses = [
        {
            expert: 'Elon Musk',
            advice: 'First principles: What are the fundamental physics/economics here? If AI truly solves customer problems 10x better, pivot immediately. Most people wait too long. "The best time to plant a tree was 20 years ago. The second best time is now."',
            risk: '15%',
            timeline: '3-6 months',
            confidence: '87%'
        },
        {
            expert: 'Warren Buffett',
            advice: 'What\'s your competitive moat in AI vs traditional software? Don\'t follow trends - follow value creation. If you can\'t explain why customers will pay more for your AI solution, you\'re speculating, not investing.',
            risk: '8%',
            timeline: '12-24 months',
            confidence: '92%'
        },
        {
            expert: 'Steve Jobs',
            advice: 'Does AI make your product incredibly simple and delightful for users? Technology alone isn\'t enough - it\'s about the user experience. Pivot only if AI creates magical moments your current solution can\'t.',
            risk: '12%',
            timeline: '6-12 months',
            confidence: '89%'
        }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Simulate AI processing
    const modal = document.querySelector('.modal-content');
    modal.innerHTML = `
        <div class="text-center mb-6">
            <div class="text-4xl mb-4">🧠</div>
            <h3 class="text-2xl font-bold mb-4 text-green-400">Expert DNA Analysis Complete</h3>
        </div>

        <div class="bg-black/70 p-6 rounded-xl mb-6 border border-green-400/30">
            <div class="flex items-center mb-4">
                <div class="text-2xl mr-3">🎯</div>
                <div class="font-bold text-white">${response.expert}'s Decision Pattern Applied</div>
            </div>
            
            <div class="text-yellow-300 mb-4 text-lg font-medium">"${response.advice}"</div>
            
            <div class="grid grid-cols-3 gap-4 mt-4">
                <div class="text-center">
                    <div class="text-sm text-white/60">Risk Level</div>
                    <div class="text-xl font-bold text-green-400">${response.risk}</div>
                </div>
                <div class="text-center">
                    <div class="text-sm text-white/60">Timeline</div>
                    <div class="text-xl font-bold text-blue-400">${response.timeline}</div>
                </div>
                <div class="text-center">
                    <div class="text-sm text-white/60">Confidence</div>
                    <div class="text-xl font-bold text-purple-400">${response.confidence}</div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onclick="bookExpertCall()" class="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:scale-105 transition-all">
                📞 Book Call with Real Expert
            </button>
            <button onclick="tryAnotherScenario()" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:scale-105 transition-all">
                🎲 Try Different Scenario
            </button>
        </div>
    `;

    showNotification('🎉 This is just a demo! The real AI Expert Brain will launch soon with 100+ industry legends.');
}

// Live Decision Coaching
function startDecisionCoaching() {
    createRevolutionaryModal(`
        <div class="text-center mb-6">
            <div class="text-5xl mb-4 animate-bounce">⚡</div>
            <h2 class="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Live Decision Coach
            </h2>
            <p class="text-white/80 mb-6">Get real-time guidance as you work through complex decisions</p>
        </div>

        <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl mb-6 border border-purple-400/30">
            <div class="flex items-center mb-4">
                <div class="w-4 h-4 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <div class="text-white font-medium">Live Session Active</div>
            </div>
            
            <div class="space-y-3 text-sm">
                <div class="text-purple-300">Coach: What specific decision are you facing right now?</div>
                <div class="bg-black/30 p-3 rounded-lg">
                    <input type="text" placeholder="Type your decision challenge..." 
                           class="w-full bg-transparent text-white outline-none" 
                           onkeypress="handleCoachInput(event)">
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="glass-dark p-4 rounded-lg">
                <div class="text-green-400 font-bold mb-2">✅ What You Know</div>
                <div class="text-white/70 text-sm">Facts, data, constraints</div>
            </div>
            <div class="glass-dark p-4 rounded-lg">
                <div class="text-yellow-400 font-bold mb-2">❓ What You Don't Know</div>
                <div class="text-white/70 text-sm">Unknowns, risks, assumptions</div>
            </div>
        </div>

        <div class="text-center">
            <button onclick="simulateCoachingSession()" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all animate-glow">
                ⚡ Start Live Coaching
            </button>
        </div>
    `);
}

// Expert Mode Training (Gamified)
function openExpertMode() {
    createRevolutionaryModal(`
        <div class="text-center mb-6">
            <div class="text-5xl mb-4">🎮</div>
            <h2 class="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Expert Mode Training
            </h2>
            <p class="text-white/80 mb-6">Level up your decision-making skills through interactive scenarios</p>
        </div>

        <div class="bg-gradient-to-r from-blue-500/20 to-green-500/20 p-6 rounded-xl mb-6">
            <div class="flex justify-between items-center mb-4">
                <div class="text-white font-bold">Your Expert Level</div>
                <div class="text-green-400 font-bold">Level 3 - Rising Star ⭐</div>
            </div>
            
            <div class="w-full bg-black/30 rounded-full h-3 mb-4">
                <div class="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full" style="width: 65%"></div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                    <div class="text-green-400 font-bold">23</div>
                    <div class="text-white/60">Decisions Made</div>
                </div>
                <div>
                    <div class="text-blue-400 font-bold">87%</div>
                    <div class="text-white/60">Success Rate</div>
                </div>
                <div>
                    <div class="text-purple-400 font-bold">1,240</div>
                    <div class="text-white/60">XP Points</div>
                </div>
            </div>
        </div>

        <div class="space-y-4 mb-6">
            <div class="glass-dark p-4 rounded-lg cursor-pointer hover:scale-105 transition-all border border-green-400/30" onclick="startScenario('startup')">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-bold text-green-400">🚀 Startup Scenario</div>
                        <div class="text-white/70 text-sm">Navigate a funding crisis</div>
                    </div>
                    <div class="text-green-400 font-bold">+150 XP</div>
                </div>
            </div>

            <div class="glass-dark p-4 rounded-lg cursor-pointer hover:scale-105 transition-all border border-blue-400/30" onclick="startScenario('investment')">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-bold text-blue-400">💰 Investment Challenge</div>
                        <div class="text-white/70 text-sm">Portfolio allocation decision</div>
                    </div>
                    <div class="text-blue-400 font-bold">+200 XP</div>
                </div>
            </div>

            <div class="glass-dark p-4 rounded-lg cursor-pointer hover:scale-105 transition-all border border-purple-400/30" onclick="startScenario('leadership')">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-bold text-purple-400">👥 Leadership Crisis</div>
                        <div class="text-white/70 text-sm">Manage team conflict</div>
                    </div>
                    <div class="text-purple-400 font-bold">+250 XP</div>
                </div>
            </div>
        </div>

        <button onclick="startRandomChallenge()" class="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 rounded-xl font-bold hover:scale-105 transition-all animate-glow">
            🎲 Random Challenge (Surprise XP!)
        </button>
    `);
}

// Try Live Demo
function tryLiveDemo() {
    createRevolutionaryModal(`
        <div class="text-center mb-6">
            <div class="text-5xl mb-4">🚀</div>
            <h2 class="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Live Expert Brain Demo
            </h2>
            <p class="text-white/80 mb-6">See how our AI simulates Warren Buffett's decision-making process</p>
        </div>

        <div class="bg-black/70 p-6 rounded-xl mb-6">
            <div class="text-green-400 text-sm mb-4">🔴 LIVE ANALYSIS IN PROGRESS...</div>
            
            <div class="space-y-3 text-sm font-mono">
                <div class="text-white/80">Your Input: "Should I invest in a promising AI startup?"</div>
                <div class="text-yellow-300">> Loading Warren Buffett's investment framework...</div>
                <div class="text-blue-400">> Analyzing through value investing lens...</div>
                <div class="text-green-400">> Applying 40+ years of market wisdom...</div>
            </div>

            <div class="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-400/30">
                <div class="text-yellow-300 font-bold mb-2">Warren's Response:</div>
                <div class="text-white/90 text-lg">"I don't invest in businesses I don't understand. Can you explain this AI company's competitive moat in simple terms? If not, it's probably too complex. Focus on businesses with predictable cash flows and strong management teams."</div>
                
                <div class="grid grid-cols-2 gap-4 mt-4 text-center">
                    <div>
                        <div class="text-red-400 text-xl font-bold">❌ PASS</div>
                        <div class="text-white/60 text-sm">Risk: Too High</div>
                    </div>
                    <div>
                        <div class="text-yellow-400 text-xl font-bold">💡 LEARN</div>
                        <div class="text-white/60 text-sm">Study more first</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center">
            <button onclick="tryWithMyProblem()" class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all animate-glow">
                🔥 Try With My Actual Problem
            </button>
        </div>
    `);
    
    setTimeout(() => showNotification('🎉 Amazing, right? This is just 0.1% of what the full Expert DNA platform can do!'), 3000);
}

// Create revolutionary modal
function createRevolutionaryModal(content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="glass-card rounded-2xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto modal-content">
            <div class="flex justify-end mb-4">
                <button onclick="this.closest('.fixed').remove()" class="text-white/60 hover:text-white text-2xl">×</button>
            </div>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Helper functions for the revolutionary features
function tryWithMyProblem() {
    showNotification('🚀 The full platform launches in 30 days! Join our waitlist to be the first to experience Expert DNA technology.');
}

function bookExpertCall() {
    showNotification('📞 Connecting you with our expert network... This feature will be available in the full platform!');
}

function tryAnotherScenario() {
    generateExpertAdvice();
}

function handleCoachInput(event) {
    if (event.key === 'Enter') {
        showNotification('🎯 AI Coach is analyzing your input... Full coaching sessions launch with the platform!');
    }
}

function simulateCoachingSession() {
    showNotification('⚡ Live coaching sessions will be available 24/7 in the full platform! You\'ll have an expert coach in your pocket.');
}

function startScenario(type) {
    showNotification(`🎮 ${type.charAt(0).toUpperCase() + type.slice(1)} training scenario coming soon! Gamified learning makes expertise fun.`);
}

function startRandomChallenge() {
    showNotification('🎲 Random challenge mode will keep you sharp! Daily expert challenges to level up your decision-making.');
}

// Revolutionary waitlist function
function joinWaitlist() {
    createRevolutionaryModal(`
        <div class="text-center mb-8">
            <div class="text-6xl mb-4 animate-bounce">🚀</div>
            <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Join the Revolution
            </h2>
            <p class="text-white/80 text-xl mb-6">Be among the first to experience Expert DNA technology</p>
            
            <!-- Countdown Timer -->
            <div class="bg-red-500/20 p-4 rounded-xl mb-6 border border-red-400/50">
                <div class="text-red-300 font-bold mb-2">⏰ BETA LAUNCH COUNTDOWN</div>
                <div id="countdown" class="text-3xl font-mono font-bold text-white">29:23:47:32</div>
                <div class="text-red-200 text-sm">Days : Hours : Minutes : Seconds</div>
            </div>
        </div>

        <div class="space-y-6 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-white/90 font-medium mb-2">First Name *</label>
                    <input type="text" id="waitlistFirstName" placeholder="Steve" 
                           class="w-full p-3 glass-dark rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 outline-none transition-all">
                </div>
                <div>
                    <label class="block text-white/90 font-medium mb-2">Last Name *</label>
                    <input type="text" id="waitlistLastName" placeholder="Jobs" 
                           class="w-full p-3 glass-dark rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 outline-none transition-all">
                </div>
            </div>

            <div>
                <label class="block text-white/90 font-medium mb-2">Email Address *</label>
                <input type="email" id="waitlistEmail" placeholder="steve@apple.com" 
                       class="w-full p-3 glass-dark rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 outline-none transition-all">
            </div>

            <div>
                <label class="block text-white/90 font-medium mb-2">What's your biggest business challenge?</label>
                <textarea id="waitlistChallenge" placeholder="e.g. I need to make better strategic decisions for my startup..." rows="3"
                          class="w-full p-3 glass-dark rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 outline-none resize-none transition-all"></textarea>
            </div>

            <div>
                <label class="block text-white/90 font-medium mb-2">Which expert would you want to "think like" first?</label>
                <select id="waitlistExpert" class="w-full p-3 glass-dark rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all">
                    <option value="">Choose your first Expert DNA...</option>
                    <option value="elon">🚀 Elon Musk (Innovation & Risk)</option>
                    <option value="warren">💰 Warren Buffett (Value & Patience)</option>
                    <option value="steve">📱 Steve Jobs (Vision & Design)</option>
                    <option value="bezos">📦 Jeff Bezos (Customer Obsession)</option>
                    <option value="oprah">🎯 Oprah Winfrey (Leadership & Influence)</option>
                    <option value="gates">💻 Bill Gates (Systems & Scale)</option>
                </select>
            </div>
        </div>

        <!-- Special Offers -->
        <div class="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 p-6 rounded-xl mb-6 border border-yellow-400/50">
            <h3 class="text-yellow-400 font-bold text-xl mb-4 text-center">🎁 Beta Founder Benefits</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="flex items-center text-white/90">
                    <div class="text-green-400 mr-2">✅</div>
                    <div>Lifetime 50% discount ($48.50/month forever)</div>
                </div>
                <div class="flex items-center text-white/90">
                    <div class="text-green-400 mr-2">✅</div>
                    <div>First access to all new Expert DNA releases</div>
                </div>
                <div class="flex items-center text-white/90">
                    <div class="text-green-400 mr-2">✅</div>
                    <div>Exclusive "Founder" badge in your profile</div>
                </div>
                <div class="flex items-center text-white/90">
                    <div class="text-green-400 mr-2">✅</div>
                    <div>Private Slack community with other founders</div>
                </div>
                <div class="flex items-center text-white/90">
                    <div class="text-green-400 mr-2">✅</div>
                    <div>Monthly live Q&A with platform creators</div>
                </div>
                <div class="flex items-center text-white/90">
                    <div class="text-green-400 mr-2">✅</div>
                    <div>Shape the future - your feedback drives development</div>
                </div>
            </div>
        </div>

        <div class="text-center">
            <button onclick="submitWaitlist()" class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 px-8 rounded-xl font-bold text-lg hover:scale-105 transition-all animate-glow mb-4">
                🚀 SECURE MY FOUNDER ACCESS
            </button>
            <div class="text-white/60 text-sm">No payment required. You'll get early access notification via email.</div>
        </div>
    `);

    // Start countdown animation
    startCountdown();
}

// Countdown animation
function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    let days = 29, hours = 23, minutes = 47, seconds = 32;

    const timer = setInterval(() => {
        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            
            if (minutes < 0) {
                minutes = 59;
                hours--;
                
                if (hours < 0) {
                    hours = 23;
                    days--;
                    
                    if (days < 0) {
                        clearInterval(timer);
                        countdownElement.textContent = "🚀 LAUNCHING NOW!";
                        return;
                    }
                }
            }
        }
        
        countdownElement.textContent = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Submit waitlist
async function submitWaitlist() {
    const firstName = document.getElementById('waitlistFirstName')?.value.trim();
    const lastName = document.getElementById('waitlistLastName')?.value.trim();
    const email = document.getElementById('waitlistEmail')?.value.trim();
    const challenge = document.getElementById('waitlistChallenge')?.value.trim();
    const expert = document.getElementById('waitlistExpert')?.value;
    
    if (!firstName || !lastName || !email) {
        showError('Please fill in all required fields!');
        return;
    }
    
    if (!email.includes('@')) {
        showError('Please enter a valid email address!');
        return;
    }
    
    const submitButton = event.target;
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>';
    submitButton.disabled = true;
    
    try {
        // Submit to real waitlist API
        const response = await fetch('/api/waitlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                challenge: challenge,
                preferredExpert: expert,
                source: getTrafficSource() // Track where they came from
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to join waitlist');
        }
        
        // Close modal and show success
        document.querySelector('.modal-content').closest('.fixed').remove();
        
        createRevolutionaryModal(`
            <div class="text-center">
                <div class="text-8xl mb-6">🎉</div>
                <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Welcome to the Revolution!
                </h2>
                <p class="text-white/90 text-xl mb-6">You're now #${result.position} on our exclusive waitlist!</p>
                
                <div class="bg-green-500/20 p-6 rounded-xl mb-6 border border-green-400/50">
                    <h3 class="text-green-400 font-bold text-xl mb-4">🎁 Your Founder Status is Confirmed</h3>
                    <div class="text-white/90 mb-4">
                        Hi ${firstName}! Check your email (${email}) for:
                    </div>
                    <ul class="text-left text-white/80 space-y-2">
                        <li>• 📧 Welcome package with exclusive previews</li>
                        <li>• 🔐 Private Founder community access</li>
                        <li>• 📅 Personal onboarding call scheduling</li>
                        <li>• 🎯 Early access notification (launching in ~30 days)</li>
                    </ul>
                </div>

                <div class="text-center">
                    <div class="text-yellow-400 font-bold text-lg mb-2">🚀 What happens next?</div>
                    <div class="text-white/70 mb-6">
                        We'll send you exclusive behind-the-scenes updates as we build the most revolutionary consulting platform ever created.
                    </div>
                    
                    <button onclick="shareRevolution()" class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition-all mr-4 mb-4">
                        📱 Share the Revolution
                    </button>
                    
                    <button onclick="this.closest('.fixed').remove()" class="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-lg font-medium hover:scale-105 transition-all mb-4">
                        Continue Exploring
                    </button>
                </div>
            </div>
        `);
        
        // Track conversion
        trackEvent('waitlist_joined', {
            firstName: firstName,
            lastName: lastName,
            email: email,
            challenge: challenge,
            preferredExpert: expert,
            position: result.position,
            waitlistId: result.waitlistId,
            source: getTrafficSource()
        });
        
    } catch (error) {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        showError('Something went wrong. Please try again!');
    }
}

// Share revolution function
function shareRevolution() {
    const shareText = "🚀 I just joined the waitlist for the world's first 'Expert DNA' platform! Think like Elon Musk, Warren Buffett, or Steve Jobs with AI. This is going to change everything! 🧬";
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Wisdom Connect - Expert DNA Platform',
            text: shareText,
            url: shareUrl,
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        showNotification('🎉 Share text copied to clipboard! Paste it anywhere to spread the revolution.');
    }
}

// Get traffic source for analytics
function getTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const referrer = document.referrer;
    
    if (utmSource) {
        return utmSource; // Product Hunt, TikTok, LinkedIn, etc.
    } else if (referrer) {
        if (referrer.includes('producthunt.com')) return 'producthunt';
        if (referrer.includes('tiktok.com')) return 'tiktok';
        if (referrer.includes('linkedin.com')) return 'linkedin';
        if (referrer.includes('instagram.com')) return 'instagram';
        if (referrer.includes('twitter.com')) return 'twitter';
        if (referrer.includes('facebook.com')) return 'facebook';
        if (referrer.includes('google.com')) return 'google';
        return 'referral';
    }
    return 'direct';
}

// Add social proof on page load
async function loadSocialProof() {
    try {
        const response = await fetch('/api/waitlist/stats');
        const result = await response.json();
        
        if (result.success) {
            // Update social proof numbers throughout the site
            const totalSignups = result.stats.totalSignups;
            const todaySignups = result.stats.todaySignups;
            
            // Add live counters to the page
            updateSocialProofCounters(totalSignups, todaySignups);
        }
    } catch (error) {
        console.log('Social proof loading failed:', error);
    }
}

// Update social proof counters
function updateSocialProofCounters(total, today) {
    // Add live signup counter to beta banner
    const betaBanner = document.querySelector('.bg-blue-600');
    if (betaBanner && !betaBanner.querySelector('.live-counter')) {
        const counter = document.createElement('div');
        counter.className = 'live-counter text-xs mt-1 opacity-75';
        counter.innerHTML = `🔥 ${total} people on waitlist • ${today} joined today`;
        betaBanner.appendChild(counter);
    }
}

// Utility functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-6 glass-card p-6 rounded-2xl z-50 max-w-sm shadow-2xl animate-float';
    notification.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="flex-1">
                <p class="text-sm text-white/90">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white/60 hover:text-white text-xl transition-colors">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-24 right-6 glass-dark border border-red-400/50 text-red-300 p-4 rounded-xl shadow-lg z-50 animate-bounce-in';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 3000);
}

function showLoadingState(element, isLoading = true) {
    if (isLoading) {
        element.disabled = true;
        element.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>';
    } else {
        element.disabled = false;
        // Restore original content
    }
}

// Analytics tracking (placeholder for Google Analytics or other services)
function trackEvent(eventName, data = {}) {
    // Google Analytics 4 event tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            custom_parameter_1: JSON.stringify(data),
            event_category: 'user_interaction',
            event_label: currentMode
        });
    }
    
    // Console log for development
    console.log('Analytics Event:', eventName, data);
}

// Performance optimization: Lazy loading for images (if needed)
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Error boundary for JavaScript errors
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    
    // In production, send to error tracking service
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error?.message || 'Unknown error',
            fatal: false
        });
    }
});

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}
