import { useEffect, useState } from "react";
import "./App.css";

const loginWithGitHub = () => {
  window.open(
    "https://github.com/login/oauth/authorize?client_id=" +
      process.env.REACT_APP_GITHUB_CLIENT_ID
  );
};

const App = () => {
  const [rerender, setRerender] = useState<boolean>(false);
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
            console.log(data);
            if (data.access_token) {
              localStorage.setItem("accessToken", data.access_token);
              setRerender(!rerender);
            }
          });
      };
      getAccessToken();
    }
  }, [rerender]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Viserion</h1>
        <button onClick={loginWithGitHub}>Login With GitHub</button>
      </header>
    </div>
  );
};

export default App;
