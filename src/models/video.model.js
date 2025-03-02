import mongoose,{Schema} from "mongoose";
import mongooseAgreegatePaginate from "mongoose-aggregate-paginate-v2"

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

videoSchema.plugin(mongooseAgreegatePaginate)
export const Video=mongoose.model("Video",videoSchema)

