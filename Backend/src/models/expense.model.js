import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "CategoryBudget", required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);

