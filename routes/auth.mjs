import { Router } from "express";
import { getInternalToken, getPublicToken } from "../services/app.mjs";




const authRouter = Router();
// auth routes
authRouter.route("/token").get(async(req,res) => {
    try {
       const publicToken = await getPublicToken();

    //    const interltoken = await getInternalToken();

       res.json(publicToken)
    } catch (error) {
        console.log('error', error)
    }
})

export default authRouter