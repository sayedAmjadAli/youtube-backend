import { User } from "../models/user.model.js"
import bcrypt from "bcrypt"

import nodemailer from "nodemailer"
import { EMAIL_PASSWORD, EMAIL_USERNAME, SENDER_EMAIL ,DOMAIN} from "../config/env.js"

export const sendEmail = async function ({ email, emailType, userId }) {
    try {
        const hashedToken = await bcrypt.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId,
                {
                    verifyToken: hashedToken, verifyTokenExpiry:  Date.now() + 3600000
                }
            )
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId,
                {
                    forgetPasswordToken: hashedToken, forgetPasswordTokenExpiry:  Date.now() + 3600000
                }
            )
        }

    
const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD
    }
  });

  const mailoptions={
    from:SENDER_EMAIL,
    to:email,
    subject:emailType ==="VERIFY" ? "Verify Your Email ": "Reset Your password",
    html:`<p>Click on this click to ${emailType ==="VERIFY" ? "Verify Your Email ": "Reset Your password"} <br> ${DOMAIN}/verifyEmail?token=${hashedToken}</p>`
  }

  const mailResponse=await transport.sendMail(mailoptions)
  return mailResponse
    } catch (error) {
    throw new Error(error)
    }
}