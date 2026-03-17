import express from "express"
import cors from "cors"
import connectDb from "./db.js"
import authRoutes from "./routes/auth.routes.js"
import usersRoutes from "./routes/user.routes.js"

const app = express()
const port = 3001

// CORS must be configured before routes
app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(express.json())

connectDb()

app.use("/api/user", authRoutes)
app.use("/api/users", usersRoutes)

app.listen(port, () => {
    return console.log(`app stater on port ${port}`)
})