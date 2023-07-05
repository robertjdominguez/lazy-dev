require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSCODE,
  },
});

async function sendEmail(summaries) {
  try {
    const info = await transporter.sendMail({
      from: process.env.GOOGLE_EMAIL,
      to: process.env.GOOGLE_EMAIL,
      subject: "While you were sleeping",
      html: generateOverallSummary(summaries),
    });
    console.log("\n🚀 Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
}

function checkRole(summaries, role) {
  return summaries.filter((summary) => summary.role === role);
}

const formatContent = (content) => {
  return content.replace(/\n/g, "<br />");
};

const generateOverallSummary = (summaries) => {
  if (summaries.length > 0) {
    let overallSummary = `Good morning, ${process.env.NAME} 👋<br /><br />Here's an executive summary of everything that happened while you were asleep. Tasks have been added to your Todoist, as well.<br /><br />`;
    const reviewerSummaries = checkRole(summaries, "reviewer");
    if (reviewerSummaries.length > 0) {
      overallSummary += `<b>PRs you're reviewing:</b><br />`;
      reviewerSummaries.forEach((summary) => {
        overallSummary += `<b><a href="${summary.url}">${summary.title}</a></b><br />`;
        overallSummary += `${formatContent(summary.content)}<br /><br />`;
      });
    }
    const authorSummaries = checkRole(summaries, "author");
    if (authorSummaries.length > 0) {
      overallSummary += `<b>PRs you're the author:</b><br />`;
      authorSummaries.forEach((summary) => {
        overallSummary += `<b><a href="${summary.url}">${summary.title}</a></b><br />`;
        overallSummary += `${formatContent(summary.content)}<br /><br />`;
      });
    }
    const buddySummaries = checkRole(summaries, "buddy");
    if (buddySummaries.length > 0) {
      overallSummary += `<b>PRs in the team:</b><br />`;
      buddySummaries.forEach((summary) => {
        overallSummary += `<b><a href="${summary.url}">${summary.title}</a></b><br />`;
        overallSummary += `${formatContent(summary.content)}<br /><br />`;
      });
    }
    overallSummary += `<br /><br />Have a great day!`;
    return overallSummary;
  } else {
    return `Yo! You didn't miss anything over night. Have a great day 😎\n`;
  }
};

module.exports = sendEmail;
