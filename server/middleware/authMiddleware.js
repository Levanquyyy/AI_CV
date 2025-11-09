import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';

export const protectCompany = async (req, res, next) => {

    const token = req.headers.token 
    console.log("Token received:", token ? "✓" : "✗");

    if(!token){
        return res.json({
            success: false,
            message: "Not authorized"})
    }
    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("Token decoded:", decoded);

        req.company =  await Company.findById(decoded.id).select('-password')
        console.log("Company found:", req.company ? "✓" : "✗");

        if(!req.company) {
            return res.json({
                success: false,
                message: "Company not found"
            });
        }

        next()

    } catch (error) {
        console.log("Auth error:", error.message);
        res.json({
            success: false,
            message: "Not authorized, Login Again"})
    }

}