/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Model, ObjectId, Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";

// Creates a system for handling password reset tokens. 
// Defines a way to store, secure, and check tokens, so users can reset their passwords safely

interface PasswordResetTokenDocument {
 owner: ObjectId;
 token: string;
 createdAt: Date;
}

interface Methods {
  compareToken: (token: string) => Promise<boolean>;
}

// Create token. Tokens will expire after 1 hour
const passwordResetTokenSchema = new Schema<PasswordResetTokenDocument, {}, Methods>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // 60 min * 60 sec = 3600s
    },
  },
);

// Hash the token before saving it to the database
passwordResetTokenSchema.pre("save", async function(next){
  if(this.isModified("token")){
    this.token = await hash(this.token, 10)
  }
  next()
});

// Compare the incoming token with the hashed token in the database.
passwordResetTokenSchema.methods.compareToken = async function(token) {
  const result = await compare(token, this.token);
  return result;
}

export default model(
  "PasswordResetToken", 
  passwordResetTokenSchema
) as Model<PasswordResetTokenDocument, {}, Methods>;