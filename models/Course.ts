import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  title: String,
  zoomLink: String,
  downloadLink: String,
});

const EnrolledSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentId: String,
    orderId: String,
    amount: Number,
    status: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

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
    students: [EnrolledSchema],

    // Total revenue
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
