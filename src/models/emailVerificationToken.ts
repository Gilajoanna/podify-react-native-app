/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Model, ObjectId, Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";


interface EmailVerificationTokenDocument {
 owner: ObjectId;
 token: string;
 createdAt: Date;
}

interface Methods {
  compareToken: (token: string) => Promise<boolean>;
}

// Create token. Tokens will expire after 1 hour
const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument, {}, Methods>(
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
emailVerificationTokenSchema.pre("save", async function(next){
  if(this.isModified("token")){
    this.token = await hash(this.token, 10)
  }
  next()
});

// Compare the incoming token with the hashed token in the database.
emailVerificationTokenSchema.methods.compareToken = async function(token) {
  const result = await compare(token, this.token);
  return result;
}

export default model(
  "EmailVerificationToken", 
  emailVerificationTokenSchema
) as Model<EmailVerificationTokenDocument, {}, Methods>;