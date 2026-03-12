import mongoose from "mongoose";

const connectDb = () => {

mongoose.connect("mongodb+srv://shubhamaug888:OfldjtGw0GxidrJK@cluster0.mcdco.mongodb.net/")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log("Connection Error:", err);
})
}

export default connectDb
