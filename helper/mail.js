const { createTransport, createTestAccount, getTestMessageUrl } = require('nodemailer');

const {
  NODE_ENV, DEFAULT_MAIL_SENDER,EMAIL_USER,EMAIL_PASS
} = process.env;

async function getTransporter() {
  let transporter;
  if (NODE_ENV !== 'production') {
    const testAccount = await createTestAccount();
    transporter = createTransport({
      service: "gmail",
        auth: {
            user: EMAIL_USER, 
            pass: EMAIL_PASS, 
        }
  });
  } else {
    transporter = createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}


exports.sendMail = async (mail) => {
  const payload = mail;
  if (!payload.from) {
    payload.from = DEFAULT_MAIL_SENDER;
  }
  const transporter = await getTransporter();  
  const mailInfo = await transporter.sendMail(payload);
  if (NODE_ENV !== 'production') {
    console.log(`Mail Preview URL is ${getTestMessageUrl(mailInfo)}`);
  }
  
  return mailInfo;
}
