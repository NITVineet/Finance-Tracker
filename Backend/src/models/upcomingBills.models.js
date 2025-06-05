import mongoose, { Schema } from "mongoose";
const upcomingBillsSchema = Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    billId: {
        type: String,
        required: true
    },
    category: { 
        type: String,
        enum: ['electricity', 'water', 'rent', 'internet', 'others'], 
        required: true 
    },
    frequency: { 
        type: String,
        enum: ['weekly', 'monthly', 'yearly'], 
        required: true 
    },
    amount: {
        type: Number,
        required: true
    },
    dateDue: { 
        type: Date, 
        required: true 
    },
    type: {
        type: String,
        required: true
    },
    paid: { 
        type: Boolean, 
        default: false 
    },
    paidAt: { 
        type: Date 
    },
    notes: { 
        type: String 
    }
},
    {
        timestamps: true
    }
)
const UpcomingBills = mongoose.model("UpcomingBills", upcomingBillsSchema);
export default UpcomingBills;
