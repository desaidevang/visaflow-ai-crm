import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.conversationHistory = new Map();
    }

    getConversationHistory(sessionId) {
        if (!this.conversationHistory.has(sessionId)) {
            this.conversationHistory.set(sessionId, {
                collectedData: {
                    name: null,
                    phone: null,
                    profession: null,
                    currentCountry: null,
                    destination: null
                },
                conversationStage: "greeting",
                lastQuestion: null,
                waitingForField: null
            });
        }
        return this.conversationHistory.get(sessionId);
    }

    updateCollectedData(sessionId, field, value) {
        const history = this.getConversationHistory(sessionId);
        if (value && !history.collectedData[field]) {
            history.collectedData[field] = value;
            console.log(`✅ Updated ${field}: ${value}`);
        }
        return history;
    }

    async chat(sessionId, userMessage) {
        const history = this.getConversationHistory(sessionId);
        const message = userMessage.trim().toLowerCase();
        const originalMessage = userMessage.trim();
        
        console.log(`📨 Message: "${originalMessage}"`);
        console.log(`📊 Current stage: ${history.conversationStage}`);
        console.log(`📝 Collected:`, history.collectedData);
        
        const currentData = history.collectedData;
        
        // STEP 1: Capture NAME if missing
        if (!currentData.name) {
            // Check if message is likely a name (not a question, not a common word, length between 2-20 chars)
            const commonWords = ['hi', 'hello', 'hey', 'help', 'visa', 'student', 'work', 'tourist', 'business', 
                                 'yes', 'no', 'ok', 'okay', 'thanks', 'please', 'start', 'check', 'what', 'how', 'why'];
            
            const isLikelyName = !commonWords.includes(message) && 
                                 message.length >= 2 && 
                                 message.length <= 20 &&
                                 !message.includes('?') &&
                                 !message.includes('visa') &&
                                 !message.includes('student');
            
            if (isLikelyName || message.match(/^[a-z]+$/i)) {
                const name = originalMessage.charAt(0).toUpperCase() + originalMessage.slice(1).toLowerCase();
                this.updateCollectedData(sessionId, 'name', name);
                console.log(` Captured name: ${name}`);
                // Return next question immediately
                return `Nice to meet you ${name}!  What's your phone number? I'll only use this to connect you with our visa experts.`;
            }
        }
        
        // STEP 2: Capture PHONE if missing
        if (!currentData.phone && currentData.name) {
            const phoneMatch = originalMessage.match(/(\+?\d{1,3}[-.]?)?\d{10}/);
            if (phoneMatch) {
                const phone = phoneMatch[0].replace(/[-.]/g, '');
                this.updateCollectedData(sessionId, 'phone', phone);
                console.log(` Captured phone: ${phone}`);
                return "Perfect! Tell me about yourself - are you a student, professional, business owner, or planning a tourist trip? ";
            } else if (message.length > 0 && !message.includes('phone') && !message.includes('number')) {
                // If user didn't provide a valid phone number, ask again
                return `Hmm, I didn't catch that. Could you please share your phone number so our experts can reach you? 📱 (Just numbers, like 9876543210)`;
            }
        }
        
        // STEP 3: Capture PROFESSION if missing
        if (!currentData.profession && currentData.phone) {
            const professionMap = {
                'student': 'student', 'studying': 'student', 'college': 'student', 'university': 'student',
                'professional': 'professional', 'work': 'professional', 'working': 'professional', 'job': 'professional',
                'business': 'business', 'entrepreneur': 'business', 'owner': 'business',
                'tourist': 'tourist', 'travel': 'tourist', 'vacation': 'tourist', 'holiday': 'tourist'
            };
            
            for (const [key, value] of Object.entries(professionMap)) {
                if (message.includes(key)) {
                    this.updateCollectedData(sessionId, 'profession', value);
                    console.log(` Captured profession: ${value}`);
                    return "Got it!  Which country are you currently living in?";
                }
            }
            
            // If no profession detected, ask again with clearer options
            return "I'm here to help! Just let me know - are you a student, professional, business owner, or tourist?  (You can type: student, professional, business, or tourist)";
        }
        
        // STEP 4: Capture CURRENT COUNTRY if missing
        if (!currentData.currentCountry && currentData.profession) {
            const countries = {
                'india': 'India', 'indian': 'India',
                'usa': 'USA', 'united states': 'USA', 'america': 'USA',
                'uk': 'UK', 'united kingdom': 'UK', 'britain': 'UK',
                'canada': 'Canada', 'australia': 'Australia', 'germany': 'Germany',
                'france': 'France', 'china': 'China', 'japan': 'Japan',
                'uae': 'UAE', 'dubai': 'UAE', 'italy': 'Italy', 'spain': 'Spain'
            };
            
            for (const [key, value] of Object.entries(countries)) {
                if (message.includes(key)) {
                    this.updateCollectedData(sessionId, 'currentCountry', value);
                    console.log(` Captured current country: ${value}`);
                    return "Exciting!  Which country would you like to travel to?";
                }
            }
            
            // Check for short country codes or abbreviations
            if (message.length === 2 && message.match(/^[a-z]{2}$/i)) {
                const countryCodes = {
                    'in': 'India', 'us': 'USA', 'uk': 'UK', 'ca': 'Canada', 
                    'au': 'Australia', 'de': 'Germany', 'fr': 'France', 'cn': 'China', 'jp': 'Japan'
                };
                if (countryCodes[message]) {
                    this.updateCollectedData(sessionId, 'currentCountry', countryCodes[message]);
                    return "Exciting! ✈️ Which country would you like to travel to?";
                }
            }
            
            // If no country detected, ask again
            return "Which country are you currently living in? (e.g., India, USA, UK, Canada) ";
        }
        
        // STEP 5: Capture DESTINATION if missing
        if (!currentData.destination && currentData.currentCountry) {
            const countries = {
                'india': 'India', 'indian': 'India',
                'usa': 'USA', 'united states': 'USA', 'america': 'USA',
                'uk': 'UK', 'united kingdom': 'UK', 'britain': 'UK',
                'canada': 'Canada', 'australia': 'Australia', 'germany': 'Germany',
                'france': 'France', 'china': 'China', 'japan': 'Japan',
                'uae': 'UAE', 'dubai': 'UAE', 'italy': 'Italy', 'spain': 'Spain'
            };
            
            for (const [key, value] of Object.entries(countries)) {
                if (message.includes(key)) {
                    this.updateCollectedData(sessionId, 'destination', value);
                    console.log(`✅ Captured destination: ${value}`);
                    
                    // All data collected - move to confirmation
                    const updatedData = history.collectedData;
                    return `Perfect! I've got everything I need, ${updatedData.name}! 

**Your Visa Profile:**
• Name: ${updatedData.name}
• Phone: ${updatedData.phone}
• Profession: ${updatedData.profession}
• From: ${updatedData.currentCountry}
• To: ${value}

Ready for your FREE consultation? Just say "yes" and I'll connect you with our visa experts! `;
                }
            }
            
            // If no destination detected, ask again
            return "Where would you like to travel to? (e.g., Canada, USA, UK, Australia) ";
        }
        
        // STEP 6: Handle confirmation
        if (currentData.name && currentData.phone && currentData.profession && 
            currentData.currentCountry && currentData.destination) {
            
            if (message.includes('yes') || message.includes('yeah') || message.includes('sure') || 
                message.includes('ok') || message.includes('book') || message.includes('confirm')) {
                
                history.conversationStage = "completed";
                
                // Generate recommendations using Gemini
                let recommendations = "";
                try {
                    const prompt = `Give quick, friendly visa advice for a ${currentData.profession} traveling from ${currentData.currentCountry} to ${currentData.destination}. Keep under 100 words.`;
                    const result = await this.model.generateContent(prompt);
                    recommendations = result.response.text();
                } catch (error) {
                    recommendations = "Our visa expert will share personalized recommendations when they contact you!";
                }
                
                return `🎉 Awesome! Your FREE consultation is booked, ${currentData.name}!

📋 **Details saved:**
• Name: ${currentData.name}
• Phone: ${currentData.phone}
• Profession: ${currentData.profession}
• From: ${currentData.currentCountry}
• To: ${currentData.destination}

${recommendations}

💫 A visa expert will contact you within 24 hours. Got any questions in the meantime?`;
            } 
            else if (message.includes('no') || message.includes('nope')) {
                return "No worries! Which detail would you like to correct? (name, phone, profession, current country, or destination) 😊";
            }
            else {
                return `Just say "yes" to book your free consultation, or tell me which detail to change! `;
            }
        }
        
        // Default fallback
        return "How can I help with your visa journey today? Just type your answer and I'll guide you! ";
    }
    
    getCollectedData(sessionId) {
        const history = this.getConversationHistory(sessionId);
        const allCollected = history.collectedData.name && history.collectedData.phone && 
                            history.collectedData.profession && history.collectedData.currentCountry && 
                            history.collectedData.destination;
        
        if (allCollected) {
            return history.collectedData;
        }
        return null;
    }
    
    clearHistory(sessionId) {
        this.conversationHistory.delete(sessionId);
    }

    async testConnection() {
        try {
            const result = await this.model.generateContent("Say 'VisaFlow is ready!'");
            console.log("✅ Gemini API Connected:", result.response.text());
            return true;
        } catch (error) {
            console.error("❌ Gemini API Connection Failed:", error.message);
            return false;
        }
    }
}

export default new GeminiService();