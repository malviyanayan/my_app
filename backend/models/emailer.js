const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",   // change if using other provider
      port: 587,
      secure: false,            // true if port 465
      auth: {
        user: "bytestream0101@gmail.com",      // <-- put your email here
        pass: "drjhbouxyvddxrho",    // <-- put your app password here
      },
    });
  }

  async sendMail(options) {
    return await this.transporter.sendMail(options);
  }

  async sendOTP(to, verification_link) {
    return await this.sendMail({
      from: `"MyApp" <no-reply@gmail.com>`,
      to,
      subject: "Verify you Account",
      html: `<h2>Your verification link: ${verification_link}</h2><p>Valid for 5 minutes.</p>`,
    });
  }
}

module.exports = new EmailService();