import geminiService from '../services/geminiServices.js';
import Lead from '../model/Lead.js';

export const sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        
        const session = sessionId || req.session.id;
        
        // Test Gemini connection first (optional)
        // await geminiService.testConnection();
        
        const response = await geminiService.chat(session, message);
        
        // Check if all data is collected and ready to save
        const collectedData = geminiService.getCollectedData(session);
        
        if (collectedData && collectedData.name && collectedData.phone) {
            // Check if lead already exists to avoid duplicates
            const existingLead = await Lead.findOne({ 
                phone: collectedData.phone,
                name: collectedData.name 
            });
            
            if (!existingLead) {
                // Create message summary
                const messageSummary = `Visa consultation request for ${collectedData.destination} as ${collectedData.profession}`;
                
                const lead = new Lead({
                    name: collectedData.name,
                    email: `${collectedData.name.toLowerCase().replace(/\s/g, '')}@temp.com`,
                    phone: collectedData.phone,
                    country: collectedData.currentCountry,
                    destination: collectedData.destination,
                    profile: collectedData.profession,
                    message: messageSummary
                });
                
                await lead.save();
                console.log(`✅ Lead saved: ${collectedData.name} - ${collectedData.phone}`);
                
                // Clear session after saving
                geminiService.clearHistory(session);
            }
        }
        
        res.json({ 
            response,
            sessionId: session,
            dataCollected: collectedData !== null
        });
        
    } catch (error) {
        console.error("Chat error:", error);
        
        // Send more specific error message
        let errorMessage = "Internal server error";
        if (error.message.includes("API key")) {
            errorMessage = "Gemini API key is invalid or missing. Please check your .env file.";
        } else if (error.message.includes("quota")) {
            errorMessage = "Gemini API quota exceeded. Please try again later.";
        } else if (error.message.includes("network")) {
            errorMessage = "Network error. Please check your internet connection.";
        }
        
        res.status(500).json({ error: errorMessage });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        const { profession, currentCountry, destination } = req.body;
        
        if (!profession || !currentCountry || !destination) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        const recommendations = await geminiService.generateRecommendations(
            profession,
            currentCountry,
            destination
        );
        
        res.json({ recommendations });
        
    } catch (error) {
        console.error("Recommendations error:", error);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
};

export const getUniversities = async (req, res) => {
    try {
        const { country, course } = req.query;
        
        const prompt = `List top 5 universities in ${country} for ${course || 'general studies'} with brief description of each. Include visa requirements for international students. Keep response under 300 words.`;
        
        const result = await geminiService.model.generateContent(prompt);
        
        res.json({ universities: result.response.text() });
        
    } catch (error) {
        console.error("Universities error:", error);
        res.status(500).json({ error: "Failed to fetch universities" });
    }
};

export const getVisaInfo = async (req, res) => {
    try {
        const { fromCountry, toCountry, visaType } = req.query;
        
        const prompt = `Provide visa information for ${visaType || 'tourist'} visa from ${fromCountry} to ${toCountry}. Include: requirements, processing time, fees, and tips for approval. Keep response under 300 words.`;
        
        const result = await geminiService.model.generateContent(prompt);
        
        res.json({ visaInfo: result.response.text() });
        
    } catch (error) {
        console.error("Visa info error:", error);
        res.status(500).json({ error: "Failed to fetch visa information" });
    }
};

// Test endpoint to verify Gemini connection
export const testGemini = async (req, res) => {
    try {
        const isConnected = await geminiService.testConnection();
        res.json({ 
            status: isConnected ? "connected" : "failed",
            message: isConnected ? "Gemini API is working" : "Failed to connect to Gemini API"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};