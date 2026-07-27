import mongoose from "mongoose"

const groupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true,
        },
        groupColor: {
            type: String,
            required: true,
        },
        groupTime: {
            
                type: Number,
                required: true,
                min: 0,
            }

    },
    {
        timestamps: true
    }
)

const Group = mongoose.model("Group", groupSchema)

export default Group