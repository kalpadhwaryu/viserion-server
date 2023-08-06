import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

const importDynamic = new Function("modulePath", "return import(modulePath)");

const fetch = async (...args: any[]) => {
  const module = await importDynamic("node-fetch");
  return module.default(...args);
};

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

app.get("/getAccessToken", async (req: any, res: any) => {
  const params =
    "?client_id=" +
    process.env.GITHUB_CLIENT_ID +
    "&client_secret=" +
    process.env.GITHUB_CLIENT_SECRET +
    "&code=" +
    req.query.code;
  await fetch("https://github.com/login/oauth/access_token" + params, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      res.json(data);
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Sample hardcoded access tokens for GitHub and Jira
// const accessTokens: Record<string, string> = {
//   github: "GITHUB_ACCESS_TOKEN",
//   jira: "YOUR_JIRA_ACCESS_TOKEN",
// };

// Middleware for OAuth validation
// const validateOAuth = (req: Request, res: Response, next: NextFunction) => {
//   const { integration } = req.params;
//   const token = accessTokens[integration];
//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Invalid integration or missing access token." });
//   }
//   // Assuming the access token is in the Authorization header as 'Bearer YOUR_ACCESS_TOKEN'
//   const authToken = req.header("Authorization");
//   if (!authToken || authToken !== `Bearer ${token}`) {
//     return res.status(403).json({ message: "Invalid access token." });
//   }
//   next();
// };

// Middleware for logging request URLs
// const logRequest = (req: Request, res: Response, next: NextFunction) => {
//   console.log(`Request URL: ${req.url}`);
//   next();
// };

// Define your API endpoints
// app.get(
//   "/list/:integration/:entity",
//   validateOAuth,
//   async (req: Request, res: Response) => {
//     const { integration, entity } = req.params;

//     // Perform API call using fetch (you can use Axios instead if preferred)
//     try {
//       // Example API call using Axios
//       const response = await axios.get(
//         `https://api.example.com/${integration}/${entity}`,
//         {
//           headers: { Authorization: `Bearer ${accessTokens[integration]}` },
//         }
//       );

//       // Process the response and send it back
//       res.json(response.data);
//     } catch (error) {
//       console.error("Error while fetching data:", error);
//       res.status(500).json({ message: "Error while fetching data." });
//     }
//   }
// );
