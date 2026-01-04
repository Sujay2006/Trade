import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  googleId?: string;
  profilePicture?: string;
  role: "user" | "admin";
}

const UserSchema = new Schema<IUser>({
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: String,
  profilePicture: String,
  role: { type: String, default: "user" }
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
