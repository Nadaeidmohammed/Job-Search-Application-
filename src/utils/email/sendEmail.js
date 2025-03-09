import nodemailer from "nodemailer"
export const sendEmail =async({to,subject,html})=>{
    const transporter= nodemailer.createTransport({
        service:"gmail",
        port:465,
        secure:true,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    const emailInfo =await transporter.sendMail({
        from:`"Job Search Application "<${process.env.EMAIL}>`,
        to,
        subject,
        html
    })
    return emailInfo.rejected.length===0?true:false;
}

