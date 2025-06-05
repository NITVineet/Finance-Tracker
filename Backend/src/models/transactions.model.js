import mongoose,{Schema} from "mongoose";

import {User} from "./User";

const transactionsSchema = new Schema({
    id : {
        type : Number,
        required : true
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    amount : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now()
    },
    place : {
        type : String,
    }

}
,{
    timestamps : true
})

export default transactions = mongoose.model("transactions",transactionsSchema)