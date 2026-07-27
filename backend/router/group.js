import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as groupcontroller from "../controller/group.js"

const router = express.Router()

//http://127.0.0.1:3000/group
router.post("/", groupcontroller.addGroup)

















export default router