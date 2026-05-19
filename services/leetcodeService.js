import axios from "axios";

export async function getSolvedStats(username) {
  const query = {
    query: `
      query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `,
    variables: {
      username
    }
  };

  const response = await axios.post(
    "https://leetcode.com/graphql",
    query
  );

  const matchedUser = response.data.data.matchedUser;

  if (!matchedUser) {
    throw new Error("LeetCode user not found");
  }

  const stats = matchedUser.submitStats.acSubmissionNum;

  return {
    total: stats.find(x => x.difficulty === "All").count,
    easy: stats.find(x => x.difficulty === "Easy").count,
    medium: stats.find(x => x.difficulty === "Medium").count,
    hard: stats.find(x => x.difficulty === "Hard").count
  };
}