import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalBudget: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "CategoryBudget" }]
});

module.exports = mongoose.model("Budget", BudgetSchema);
