import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  leetcodeUsername: {
    type: String,
    default: ""
  },

  rolls: {
    type: Number,
    default: 0
  },

  lastSolvedCount: {
    type: Number,
    default: 0
  },

  lastSync: {
    type: Date
  }
});

const User = mongoose.model("User", userSchema);

export default User;
