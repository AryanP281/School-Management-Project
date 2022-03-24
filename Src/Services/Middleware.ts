/**********************Imports**************** */
import {Request,Response} from "express";
import {responseCodes} from "../Config/AppConfig";
import jwt from "jsonwebtoken";

/**********************Middleware**************** */
async function verifyToken(req : Request, resp: Response, next : any) : Promise<void>
{
    /*Verifies the user token */

    const token : string | undefined = req.get("Authorization");
    if(!token)
    {
        resp.status(200).json({success:false, code: responseCodes.invalidToken});
        return;
    }

    try
    {
        //Verifing token
        const userDetails : any = jwt.verify(token, process.env.JWTSECRET!);
        userDetails.id = BigInt(userDetails.id);
        req.body.userDetails = userDetails;
        
        next();
    }
    catch(err)
    {
        console.log(err);
        resp.status(200).json({success:false, code: responseCodes.invalidToken});
    }
}

/**********************Exports**************** */
export {verifyToken};