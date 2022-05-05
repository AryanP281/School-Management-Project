
/************************Imports******************** */
import {Request, Response} from "express";
import { responseCodes } from "../Config/AppConfig";
import {dbPool} from "../Config/MariadbConfig";
import {compareHash, generateToken, hash} from "../Services/Crypto";

/************************Controllers******************** */
async function registerAdmin(req : Request, resp : Response) : Promise<void>
{
    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }
    
    try
    {
        //Getting and checking admin details
        const adminDetails : {email:string,password:string} = req.body;
        if(!adminDetails.email || !adminDetails.password || !adminDetails.email.length || !adminDetails.password.length)
        {
            resp.sendStatus(400);
            return;
        }

        //Checking if admin account has already been registered
        const adminExists : BigInt = (await dbPool.query("SELECT COUNT(id) AS count FROM admin WHERE email=?", [adminDetails.email]))[0]['count'];
        if(adminExists !== BigInt(0))
        {
            resp.status(200).json({success: false, code: responseCodes.alreadyExists});
            return;
        }

        //Creating new admin account
        const adminId : BigInt = (await dbPool.query("INSERT INTO admin(email,password) VALUE (?,?)", [adminDetails.email, await hash(adminDetails.password)])).insertId;
        
        //Generating token
        const jwt : string = generateToken({id: adminId.toString(), isAdmin: true});

        resp.status(200).json({success: true, token: jwt});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function authenticateAdmin(req:Request, resp:Response) : Promise<void>
{
    try
    {
        const adminCreds : {email:string,password:string} = req.body;
        if(!adminCreds.email || !adminCreds.password || !adminCreds.email.length || !adminCreds.password.length)
        {
            resp.sendStatus(400);
            return;
        }

        //Getting account password
        const accountDetails : {id:BigInt,password:string} = (await dbPool.query("SELECT id,password FROM admin WHERE email=?",[adminCreds.email]))[0];
        if(!accountDetails)
        {
            resp.status(200).json({success: false, code: responseCodes.doesntExist});
            return;
        }

        //Comparing passwords
        if(!(await compareHash(adminCreds.password, accountDetails.password)))
        {
            resp.status(200).json({success:false, code:responseCodes.incorrectPassword});
            return;
        }

        //Generating token
        const token = generateToken({id:accountDetails.id.toString(), isAdmin:true});

        resp.status(200).json({success: true, token});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

/************************Exports******************** */
export {registerAdmin, authenticateAdmin};