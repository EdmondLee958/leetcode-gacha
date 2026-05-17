import axios from "axios";

export async function getSolvedCount(username) {

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

    const stats =
        response.data.data
        .matchedUser
        .submitStats
        .acSubmissionNum;

    const totalSolved =
        stats.find(
            x => x.difficulty==="All"
        ).count;

    return totalSolved;
}