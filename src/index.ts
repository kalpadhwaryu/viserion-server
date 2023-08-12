import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Response as FetchResponse } from "node-fetch";
import {
  AvailableResource,
  GitHubAccessTokenResponse,
  GitHubEntity,
  GitHubResponseData,
  JiraAccessTokenResponse,
  JiraEntity,
} from "./model";

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

app.get("/", async (req: Request, res: Response) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(
    `<html><body><h2>${
      req.query.code && req.query.state ? "Jira" : "GitHub"
    } Logged In. This tab can be closed now.</h2></body></html>`
  );
  res.end();
});

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
    const response: FetchResponse = await fetch(
      "https://github.com/login/oauth/access_token" + params,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const data = (await response.json()) as GitHubAccessTokenResponse;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// Gets Users Followers and Repos
app.get("/github/:entity", async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  try {
    const userResponse: FetchResponse = await fetch(
      "https://api.github.com/user",
      {
        method: "GET",
        headers: {
          Authorization: req.header("Authorization"),
        },
      }
    );

    const userData = (await userResponse.json()) as GitHubResponseData;
    let dataUrl: string;
    if (entity === "followers") {
      dataUrl = userData.followers_url;
    } else if (entity === "repos") {
      dataUrl = userData.repos_url;
    } else {
      return res.status(400).json({ error: "Invalid entity" });
    }

    const dataResponse: FetchResponse = await fetch(dataUrl, {
      method: "GET",
      headers: {
        Authorization: req.header("Authorization"),
      },
    });
    const responseData = (await dataResponse.json()) as GitHubEntity[];
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
    redirect_uri: "http://localhost:8080/",
  };
  try {
    const response: FetchResponse = await fetch(
      "https://auth.atlassian.com/oauth/token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );
    const data = (await response.json()) as JiraAccessTokenResponse;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// Get Jira Projects/Dashboards
app.get("/jira/:entity", async (req: Request, res: Response) => {
  const entity = req.params.entity;

  try {
    const availableResourceResponse: FetchResponse = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        method: "GET",
        headers: {
          Authorization: req.header("Authorization"),
        },
      }
    );

    const availableResourceData =
      (await availableResourceResponse.json()) as AvailableResource[];
    const usefulResource = availableResourceData.find((availableResource) => {
      return (
        availableResource.scopes.includes("read:jira-user") &&
        availableResource.scopes.includes("read:jira-work")
      );
    })!;
    const cloudId = usefulResource.id;

    const dataResponse: FetchResponse = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/2/${entity}`,
      {
        method: "GET",
        headers: {
          Authorization: req.header("Authorization"),
        },
      }
    );

    const responseData = (await dataResponse.json()) as JiraEntity;
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
