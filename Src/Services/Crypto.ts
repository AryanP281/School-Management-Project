
/************************Imports******************** */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../Server";

/********************************Variables*********************** */
const saltRounds : number = 10; //The number of salt rounds for bcrypt hashing

/************************Functions******************** */
function hash(val : string) : Promise<string>
{
    /*Hashes the given value using bcrypt */

    return bcrypt.hash(val, saltRounds);
}

function compareHash(val : string, hashed : string) : Promise<boolean>
{
    /*Checks if the given value matches with the given hashed value */

    return bcrypt.compare(val, hashed);
}

function generateToken(body : any) : string
{
    /*Generates and returns JWT containing the given body*/

    return jwt.sign(body,JWT_SECRET);
}

/********************************Exports*********************** */
export {hash, compareHash, generateToken};
