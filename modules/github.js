const { Octokit } = require("@octokit/rest");
require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "check-prs-script",
  baseUrl: "https://api.github.com",
});

const getPRs = async () => {
  const { data: PRs } = await octokit.pulls.list({
    owner: process.env.ORGANIZATION,
    repo: process.env.REPO,
    state: "open",
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });

  const myPRs = PRs.filter((pr) => {
    const reviewers = pr.requested_reviewers.map((reviewer) => reviewer.login);
    const isReviewer = reviewers.includes(process.env.GITHUB_USERNAME);
    const isAuthor = pr.user.login === process.env.GITHUB_USERNAME;
    const isBuddy = pr.user.login === process.env.GITHUB_BUDDY;
    // to each PR, add a role property
    if (isReviewer) {
      pr.role = "reviewer";
    }
    if (isAuthor) {
      pr.role = "author";
    }
    if (isBuddy) {
      pr.role = "buddy";
    }
    return isReviewer || isAuthor || isBuddy;
  });

  return myPRs;
};

const getComments = async (PRs) => {
  const comments = await Promise.all(
    PRs.map(async (pr) => {
      const { data: comments } = await octokit.issues.listComments({
        owner: process.env.ORGANIZATION,
        repo: process.env.REPO,
        issue_number: pr.number,
        since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      });

      const { data: reviewComments } = await octokit.pulls.listReviewComments({
        owner: process.env.ORGANIZATION,
        repo: process.env.REPO,
        pull_number: pr.number,
        since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      });
      comments.push(...reviewComments);

      const filteredComments = comments.filter(
        (comment) => comment.user.login !== "hasura-bot" && comment.user.login !== "github-actions[bot]"
      );

      const commentText = filteredComments.map((comment) => {
        return `${comment.body}\n\n`;
      });

      return {
        title: pr.title,
        comments: commentText,
        url: pr.html_url,
        role: pr.role,
      };
    })
  );

  return comments;
};

const runGitHub = async () => {
  const PRs = await getPRs();
  const comments = await getComments(PRs);

  console.log(
    `👀 Found ${comments.length} PRs with comments. Sending them to ChatGPT for summarization and task creation:\n`
  );

  return comments;
};

module.exports = runGitHub;
