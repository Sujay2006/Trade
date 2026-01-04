import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  banner: string;
}

const BannerSchema = new Schema<IBanner>({
  banner: { type: String, required: true, unique: true },
});

const Banner = mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);

export default Banner;
