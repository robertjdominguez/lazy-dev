const { Octokit } = require("@octokit/rest");
require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "check-prs-script",
  baseUrl: "https://api.github.com",
});

const getTeamMembers = async () => {
  let members = [];
  const { data: teamMembers } = await octokit.teams.listMembersInOrg({
    org: process.env.ORGANIZATION,
    team_slug: process.env.TEAM,
  });
  for (const member of teamMembers) {
    members.push(member.login);
  }
  return members;
};

const getPRs = async () => {
  console.log(`🧰 Aggregating PRs...`);
  const { data: PRs } = await octokit.pulls.list({
    owner: process.env.ORGANIZATION,
    repo: process.env.REPO,
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });

  const filteredPRs = [];
  for (const pr of PRs) {
    const { data: files } = await octokit.pulls.listFiles({
      owner: process.env.ORGANIZATION,
      repo: process.env.REPO,
      pull_number: pr.number,
    });
    const changedFiles = files.map((file) => file.filename);
    const hasChanges = changedFiles.some((file) => file.includes(process.env.PATH_TO_WATCH));
    if (hasChanges) {
      filteredPRs.push(pr);
    }
  }

  return filteredPRs;
};

const getComments = async (PRs, team) => {
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

      // remove any reviewComments that have 0 comments in the last 24 hours
      if (reviewComments.length === 0) {
        return;
      }

      const isAuthor = pr.user.login === process.env.GITHUB_USERNAME;

      const isBuddy = () => {
        if (!isAuthor) {
          const madeComment = reviewComments.some((comment) => team.includes(comment.user.login));
          const isReviewer = pr.requested_reviewers.some((reviewer) => team.includes(reviewer.login));
          return madeComment || isReviewer;
        }
      };

      const isReviewer = () => {
        const madeComment = reviewComments.some((comment) => comment.user.login === process.env.GITHUB_USERNAME);
        const isReviewer = pr.requested_reviewers.some((reviewer) => reviewer.login === process.env.GITHUB_USERNAME);
        return madeComment || isReviewer;
      };

      const commentText = reviewComments.map((comment) => {
        return `${comment.body}\n\n`;
      });

      return {
        title: pr.title,
        comments: commentText,
        url: pr.html_url,
        role: isAuthor ? "author" : isBuddy() ? "buddy" : isReviewer() ? "reviewer" : "unknown",
      };
    })
  );

  // for any item in the array that is undefined, remove it
  for (let i = 0; i < comments.length; i++) {
    if (comments[i] === undefined) {
      comments.splice(i, 1);
      i--;
    }
  }

  return comments;
};

const runGitHub = async () => {
  const team = await getTeamMembers();
  const PRs = await getPRs();
  const comments = await getComments(PRs, team);

  console.log(
    `👀 Found ${comments.length} PRs with comments. Sending them to ChatGPT for summarization and task creation:\n`
  );

  return comments;
};

module.exports = runGitHub;
