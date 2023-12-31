export interface GitHubAccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface JiraAccessTokenResponse extends GitHubAccessTokenResponse {
  expires_in: string;
}

export interface AvailableResource {
  id: string;
  scopes: string[];
}

export interface GitHubResponseData {
  followers_url: string;
  repos_url: string;
}

export interface Repo {
  id: string;
  name: string;
}
export interface Follower {
  id: string;
  login: string;
}

export type GitHubEntity = Repo | Follower;

export type Project = Repo;
export type Dashboard = Repo;

export interface DashboardData {
  dashboards: Dashboard[];
}

export type JiraEntity = Project[] | DashboardData;
