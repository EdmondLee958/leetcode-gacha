import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
  type: String,
  required: true
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

  easySolved: {
  type: Number,
  default: 0
},

mediumSolved: {
  type: Number,
  default: 0
},

hardSolved: {
  type: Number,
  default: 0
},

characters: {
  type: [
    {
      name: String,
      rarity: String,
      classType: String,
      level: {
        type: Number,
        default: 1
      },
      obtainedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  default: []
},

lineup: {
  type: [String],
  default: []
},

  lastSync: {
    type: Date
  }
});

const User = mongoose.model("User", userSchema);

export default User;
