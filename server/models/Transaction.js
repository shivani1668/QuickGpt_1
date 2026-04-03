import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
     userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
     planId: {type: String, required: true},
     amount: {type: Number, required: true},
     credits: {type: Number, required: true},
     isPaid: {type: Boolean, default: true},
    
}, {timestamps: true})

const Transcation = moongose.model('Transaction',transactionSchema);
export default Transcation;
