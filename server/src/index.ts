import express, { Request, Response } from "express";
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

// Gets GitHub Access Token
app.get("github/getAccessToken", async (req: Request, res: Response) => {
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

// Gets Users Followers and Repos
// Access Token is going to be passed in as an Authorization header
app.get("/github/:entity", async (req: Request, res: Response) => {
  const entity = req.params.entity;

  try {
    const userResponse = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: req.header("Authorization"),
      },
    });

    const userData = await userResponse.json();

    let dataUrl;

    if (entity === "followers") {
      dataUrl = userData.followers_url;
    } else if (entity === "repos") {
      dataUrl = userData.repos_url;
    } else {
      return res.status(400).json({ error: "Invalid entity" });
    }

    const dataResponse = await fetch(dataUrl, {
      method: "GET",
      headers: {
        Authorization: req.header("Authorization"),
      },
    });

    const responseData = await dataResponse.json();

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
