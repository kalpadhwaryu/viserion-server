import { useEffect, useState } from "react";
import "./App.css";

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
        {localStorage.getItem("accessToken") ? (
          <>
            <h2>User Logged In</h2>
            <h3>This tab can be closed now</h3>
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
            <h2>Getting Access Token...</h2>
          </>
        )}
      </header>
    </div>
  );
};

export default App;
