import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

const importDynamic = new Function(
  "modulePath",
  "return import(modulePath)"
) as (modulePath: string) => Promise<any>;

const fetch = async (...args: any[]): Promise<any> => {
  const module = await importDynamic("node-fetch");
  return module.default(...args);
};

const app: Express = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

// Gets GitHub Access Token
app.get("/github/getAccessToken", async (req: Request, res: Response) => {
  const params =
    "?client_id=" +
    process.env.GITHUB_CLIENT_ID +
    "&client_secret=" +
    process.env.GITHUB_CLIENT_SECRET +
    "&code=" +
    req.query.code;
  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token" + params,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// Gets Users Followers and Repos
app.get("/github/:entity", async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  try {
    const userResponse = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: req.header("Authorization"),
      },
    });

    const userData = await userResponse.json();
    let dataUrl: string;
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

// Gets Jira's Access Token
app.post("/jira/getAccessToken", async (req: Request, res: Response) => {
  const requestBody = {
    grant_type: "authorization_code",
    client_id: process.env.JIRA_CLIENT_ID,
    client_secret: process.env.JIRA_CLIENT_SECRET,
    code: req.body.code,
    redirect_uri: "https://localhost:3000/",
  };
  try {
    const response = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// Get Jira Projects/Dashboards
app.get("/jira/:entity", async (req: Request, res: Response) => {
  const entity = req.params.entity;

  try {
    const availableResourceResponse = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        method: "GET",
        headers: {
          Authorization: req.header("Authorization"),
        },
      }
    );

    const availableResourceData = await availableResourceResponse.json();
    const cloudId = availableResourceData[0].id;

    const dataResponse = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/2/${entity}`,
      {
        method: "GET",
        headers: {
          Authorization: req.header("Authorization"),
        },
      }
    );

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
