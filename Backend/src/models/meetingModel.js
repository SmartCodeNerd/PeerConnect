import mongoose from "mongoose";
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
    meetingCode:{
        type:String,
        required:true
    },
    userId:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now(),
        required:true
    }
});

const Meeting = mongoose.model("Meeting",meetingSchema);

export default Meeting;