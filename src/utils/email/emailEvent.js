import { EventEmitter } from "events";
import  {sendEmail } from "./sendEmail.js"
import { template } from "./generateHTML.js";
import { customAlphabet } from "nanoid";
import { hash } from "../hashing/hash.js";
import {UserModel} from "../../DB/Models/user.model.js"
import * as dbService from "../../DB/dbService.js"
import {EMAIL_SUBJECTS, OTP_TYPES} from "../constant.js"

export const emailEmitter=new EventEmitter()

emailEmitter.on("forgetPassword", async (email, firstName, id) => {
  await sendCode({ data: { email, firstName, id }, subjectType: EMAIL_SUBJECTS.RESET_PASSWORD });
});

emailEmitter.on("sendEmail", async (email, firstName, id) => {
  await sendCode({ data: { email, firstName, id }, subjectType: EMAIL_SUBJECTS.VERIFY_EMAIL });
});

export const sendCode = async ({ data = {}, subjectType = EMAIL_SUBJECTS.VERIFY_EMAIL }) => {
  const { email, firstName, id } = data;

  if (!email || !firstName || !id) {
    throw new Error("Missing required fields: email, firstName, or id");
}    
  const otp = customAlphabet("0123456789", 5)();
  const hashedOTP = hash({ plainText: otp });

  let otpType;
  switch (subjectType) {
      case EMAIL_SUBJECTS.VERIFY_EMAIL:
          otpType = OTP_TYPES.CONFIRM_EMAIL;
          break;
      case EMAIL_SUBJECTS.RESET_PASSWORD:
          otpType = OTP_TYPES.FORGET_PASSWORD;
          break;
      default:
          throw new Error("Invalid subject type");
  }
  const otpObject = {
      hashedCode: hashedOTP,
      type: otpType,
      expiresIn:new Date(Date.now() + 10 * 60 * 1000),
  };
  await dbService.updateOne({
      model: UserModel,
      filter: { _id: id },
      data: { $push: { OTP: otpObject } },
  });
  await sendEmail({
      to: email,
      subject: subjectType,
      html: template(otp, firstName, subjectType),
  });
  if (!sendEmail) {
    throw new Error("Failed to send email");
}
};