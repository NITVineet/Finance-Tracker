import mongoose from "mongoose";

const CategoryBudgetSchema = new mongoose.Schema({
    budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", required: true },
    categoryName: { type: String, required: true },
    totalBudget: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 }
});

module.exports = mongoose.model("CategoryBudget", CategoryBudgetSchema);
