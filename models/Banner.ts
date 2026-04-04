import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  banner: string;
  public_id?: string;
}

const BannerSchema = new Schema<IBanner>({
  banner: { type: String, required: true, unique: true },
  public_id: { type: String, required: false },
});

const Banner = mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);

export default Banner;
