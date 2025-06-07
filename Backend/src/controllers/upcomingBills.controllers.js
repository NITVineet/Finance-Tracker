import { upcomingBills } from "../models/upcomingBills.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createBill = asyncHandler(async (req, res) => {
    const {
        billId,
        category,
        frequency,
        amount,
        dateDue,
        type,
        paid,
        paidAt,
        notes,
    } = req.body;
    if (!billId || !category || !frequency || !amount || !dateDue || !type) {
        throw new ApiError(
            400,
            "Missing required fields: billId, category, frequency, amount, dateDue, or type"
        );
    }
    const upcomingBill = await upcomingBills.create({
        billId,
        category,
        frequency,
        amount,
        dateDue,
        type,
        paid,
        paidAt,
        notes,
        userId: req.user._id,
    });
    if (!upcomingBill) {
        throw new ApiError(404, "Bill not found");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, upcomingBill, "New bill added!"));
});

const getBills = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "UserId is not available");
    }

    const bills = await upcomingBills.find({ userId });

    if (!bills || bills.length === 0) {
        throw new ApiError(404, "No bills found for the given userId");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, bills, "Bills are successfully displayed!"));
});

const getSingleBill = asyncHandler(async (req, res) => {
    const { billId } = req.params;

    if (!billId) {
        throw new ApiError(400, "Bill ID is required");
    }

    const bill = await upcomingBills.findOne({ billId });

    if (!bill) {
        throw new ApiError(404, "Bill with the given ID not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, bill, "Bill retrieved successfully"));
});

const listBills = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400, "User Id is not available!");
    }
    const { from, to, paid, category, page = 1, limit = 10 } = req.query;
    const filter = { userId };
    if (from || to) {
        filter.dateDue = {};
        if (from) {
            filter.dateDue.$gte = new Date(from);
        }
        if (to) {
            filter.dateDue.$lte = new Date(to);
        }
    }
    if (paid != undefined) {
        if (paid == true || paid == false) {
            filter.paid = paid;
        } else {
            throw new ApiError(400, "Invalid paid value");
        }
    }
    if (category) {
        filter.category = category;
    }
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const [bills, total] = await Promise.all([
        upcomingBills.find(filter).sort({ dueDate: 1 }).skip(skip).limit(pageSize),
        upcomingBills.countDocuments(filter),
    ]);
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                bills,
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
            "Bills fetched Successfully"
        )
    );
});

const updateBill = asyncHandler(async (req, res) => {
    const { amount, frequency, dueDate } = req.body;
    const { billId } = req.params;

    if (!amount && !frequency && !dueDate) {
        throw new ApiError(400, "Invalid request");
    }
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const updatedBill = await upcomingBills.findByIdAndUpdate(
        billId,
        { $set: updateData },
        { new: true }
    );

    if (!updatedBill) {
        throw new ApiError(404, "Bill not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updateBill,"Bill updated Successfully")
    )
});

const deleteBill = asyncHandler(async (req,res) => {
    const{ billId }= req.query;
    const deletedBill = await upcomingBills.findByIdAndDelete(billId);
    if(!deletedBill){
        throw new ApiError(404, "Bill not found");
    }
    if (!mongoose.Types.ObjectId.isValid(billId)) {
        throw new ApiError(400, "Invalid billId format");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Bill deleted Successfully")
    )
})

const markPaid = asyncHandler(async (req,res)=>{
    const { billId } = req.query;

    if (!billId) {
        throw new ApiError(400, "billId is required");
    }

    if(!mongoose.Types.ObjectId.isValid(billId)){
        throw new ApiError(400, "Invalid billId format");
    }
    const bill = await upcomingBills.findById(billId);
    if(!bill){
        throw new ApiError(404, "Bill not found");
    }
    
    bill.paid = true;
    await bill.save({ validateBeforeSave: false });
    return res
    .status(200)
    .json(
        new ApiResponse(200,bill,"Bill marked as paid")
        )
})

const listUpcoming = asyncHandler(async (req,res)=>{
    const {days} = req.query;
    
    const numDays = parseInt(days,10);
    if(isNaN(numDays) || numDays <= 0){
        throw new ApiError(400, "Invalid days");
    }
    const today = new Date();
    const fututeDate = new Date();
    fututeDate.setDate(today.getDate() + numDays);

    const upcoming = await upcomingBills.find({
        dueDate : { $gte : today , $lte : fututeDate}
    }).sort({dueDate : 1})
    return res
    .status(200)
    .json(
        new ApiResponse(200,upcoming,`Bills due in the next ${numDays} day(s)`)
    )
}

)