import mongoose from "mongoose"

const groupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true,
            unique: true
        },
        groupColor: {
            type: String,
            required: true,
            unique: true
        },
        groupTime: {
            type: Number,
            required: true,
            min: 0,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

const Group = mongoose.model("Group", groupSchema)

export default Group