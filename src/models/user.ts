import { compare, hash } from "bcrypt";
import { Model, ObjectId, Schema, model } from "mongoose";

interface UserDocument {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  avatar?: { url: string; public_id: string };
  tokens: string[];
  favorites: ObjectId[];
  followers: ObjectId[];
  followings: ObjectId[];
}

interface Methods {
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<UserDocument, {}, Methods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: Object,
      url: String,
      public_id: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Audio",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tokens: [{ type: String }],
  },
  { timestamps: true }
);

// Hash the password before saving it to the database
userSchema.pre("save", async function(next){
  if(this.isModified("password")){
    this.password = await hash(this.password, 10)
  }
  next()
});

// Compare the incoming token with the hashed token in the database.
userSchema.methods.comparePassword = async function(password) {
  const result = await compare(password, this.password);
  return result;
}

export default model("User", userSchema) as Model<UserDocument, {}, Methods>;
//[String]
