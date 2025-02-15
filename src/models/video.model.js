import mongoose,{Schema} from "mongoose";

const videoSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    description:{
        type:String,
        required:true,
    },
    videoFile:{
        type:String,
    },
    duration:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
    },
   
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})


export const Video=mongoose.model("Video",videoSchema)

