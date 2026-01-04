import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  title: String,
  zoomLink: String,
  downloadLink: String,
});

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: String,
    duration: String,
    timing: String,
    seat: String,
    language: String,
    price: Number,
    salePrice: Number,
    banner: String, 
    whatsAppLink: String,
    telegramLink: String,
    modules: [ModuleSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
