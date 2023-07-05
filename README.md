# lazy-dev

## tl;dr

This repo allows you to take all activity in recent PRs of which you're part of the discussion, summarize it, and send
it to your email. It also adds tasks to your Todoist for each PR. It's a great way to stay on top of things without
having to actually stay on top of things.

I'm continually accepting my fate as a lazy developer. This is yet another step in that direction. Want to read more?
Check out this [blog post](https://www.dominguezdev.com/posts/cheap-lazy-bastard). Want to be lazy too, see below 👇

## Prerequisites

You'll need the following before proceeding:

- A
  [GitHub token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
  with the following scopes:
  - `repo`
  - `workflow`
  - `read:org`
- An [OpenAI API key](https://openai.com/blog/openai-api)
- A [Todoist API key](https://todoist.com/help/articles/find-your-api-token)
- A [Gmail app password](https://support.google.com/accounts/answer/185833?hl=en)

## Configuration

Clone the repository:

```bash
git clone https://github.com/robertjdominguez/lazy-dev.git
```

Install the dependencies:

```bash
npm i
```

Once you have the prerequisites, create an `.env` file in the root of the project. You'll need the following, so be lazy
and copy/paste:

```dotenv
GITHUB_TOKEN=
GITHUB_USERNAME=
GITHUB_BUDDY=
ORGANIZATION=
REPO=
OPENAI_API_KEY=
TODOIST_API_KEY=
TODOIST_PROJECT=
NAME=
GOOGLE_EMAIL=
GOOGLE_APP_PASSCODE=
```

## What are these variables?

| Env Var               | Description                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`        | Your GitHub token, created via `Settings > Developer Settings > PAT`                         |
| `GITHUB_USERNAME`     | Your GitHub username.                                                                        |
| `GITHUB_BUDDY`        | The name of a buddy on your team so you can stay informed and seem omniscient.               |
| `ORGANIZATION`        | The name of the organization you want to pull PRs from.                                      |
| `REPO`                | The name of the repo you want to pull PRs from.                                              |
| `OPENAI_API_KEY`      | The OpenAI API key to invoke ChatGPT.                                                        |
| `TODOIST_API_KEY`     | The Todoist API key to make you seem on top of 💩.                                           |
| `TODOIST_PROJECT`     | The name of the project in Todoist you want to add tasks to.                                 |
| `NAME`                | Your name.                                                                                   |
| `GOOGLE_EMAIL`        | Your Gmail address.                                                                          |
| `GOOGLE_APP_PASSCODE` | Your app password set via `Google Account > Security > 2-Step Verification > App Passwords`. |

## Run it

With the above values entered, you can run the script with the following command from the root of the project:

```bash
npm run start
```

It will take some time as OpenAI can be slow to respond. But, in less than 30 seconds you can have all the open PRs of
which you're part of the discussion summarized, a list of tasks related ot each added to your Todoist, and a summary of
all the information sent to your email.

## Deployment

Anywhere crons can be run. I love [Render](https://render.com) because it's cheap and easy 🎉
