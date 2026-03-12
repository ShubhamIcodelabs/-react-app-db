import express from "express"
import connectDb from "./db.js"
import authRoutes from "./routes/auth.routes.js"

const app = express()
const port = 3001

app.use(express.json());

connectDb()

app.use("/api/user",authRoutes )

app.listen(port, () => {
    return console.log(`app stater on port ${port}`)
})