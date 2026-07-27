import express from "express"
import { isAuth, isAdmin } from "../middleware/auth.js"

const router = express.Router()

router.use(isAuth, isAdmin)


export default router
