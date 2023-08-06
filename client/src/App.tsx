import { useEffect, useState } from "react";
import "./App.css";

interface UserData {
  login: string;
  name: string;
  followers_url: string;
  repos_url: string;
}

interface Follower {
  login: string;
}

const loginWithGitHub = () => {
  window.open(
    "https://github.com/login/oauth/authorize?client_id=" +
      process.env.REACT_APP_GITHUB_CLIENT_ID
  );
};

const App = () => {
  const [rerender, setRerender] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    login: "",
    followers_url: "",
    repos_url: "",
  });
  const [followersList, setFollowersList] = useState<[]>([]);
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParams = urlParams.get("code");

    if (codeParams && localStorage.getItem("accessToken") === null) {
      const getAccessToken = async () => {
        await fetch("http://localhost:8080/getAccessToken?code=" + codeParams, {
          method: "GET",
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (data.access_token) {
              localStorage.setItem("accessToken", data.access_token);
              setRerender(!rerender);
            }
          });
      };
      getAccessToken();
    }
  }, [rerender]);

  const getUserData = async () => {
    await fetch("http://localhost:8080/getUserData", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setUserData(data);
      });
  };

  const getFollowers = async () => {
    await fetch(userData.followers_url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setFollowersList(data);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Viserion</h1>
        {localStorage.getItem("accessToken") ? (
          <>
            <h2>User Logged In</h2>
            <br />
            <button onClick={getUserData}>Get User Data</button>
            {userData ? (
              <>
                <>Name :{userData.name}</>
                <br />
                <>
                  <button onClick={getFollowers}>Get Followers</button>{" "}
                  {followersList.length > 0
                    ? followersList.map((follower: Follower) => {
                        return (
                          <ul>
                            <li>{follower.login}</li>
                          </ul>
                        );
                      })
                    : ""}
                </>
              </>
            ) : (
              <></>
            )}
            <br />
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                setRerender(!rerender);
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={loginWithGitHub}>Login With GitHub</button>
          </>
        )}
      </header>
    </div>
  );
};

export default App;
