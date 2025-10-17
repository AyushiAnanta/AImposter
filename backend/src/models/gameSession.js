import mongoose, {Schema} from "mongoose";

// 1. Schema for a single Chat Message
// This defines the structure of objects inside the chatHistory array.
// It is NOT a separate collection in the database.
const ChatMessageSchema = new Schema({
    characterName: { 
        type: String, 
        required: true 
    },
    sender: {
        type: String,
        required: true,
        // The sender can ONLY be one of these two values.
        enum: ['Player', 'AI'] 
    },
    message: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});


// 2. Schema for the main Game Session
// This will be our main model and collection in MongoDB.
const GameSessionSchema = new Schema({
    status: {
        type: String,
        required: true,
        // The status can ONLY be one of these three values.
        enum: ['active', 'completed-won', 'completed-lost'], 
        default: 'active'
    },
    story: { 
        type: String, 
        required: true 
    },
    theme: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    characters: { 
        type: [Object], 
        required: true 
    },
    truth: { 
        type: String, 
        required: true 
    },
    // This is an array where each item must follow the ChatMessageSchema structure.
    chatHistory: [ChatMessageSchema] 
}, {
    // This option automatically adds `createdAt` and `updatedAt` fields.
    timestamps: true 
});

// Create and export the model
export const GameSession = mongoose.model('GameSession', GameSessionSchema);