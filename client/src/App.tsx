import { useEffect, useState } from "react";
import "./App.css";

const DB_NAME = "Github";
const OBJECT_STORE_NAME = "accessTokenStore";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      reject("Error opening database.");
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      resolve(db);
    };
  });
};

const App = () => {
  const [haveAccessToken, setHaveAccessToken] = useState<boolean>(false);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParams = urlParams.get("code");

    if (codeParams) {
      const fetchAccessToken = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/getAccessToken?code=${codeParams}`,
            {
              method: "GET",
            }
          );
          const data = await response.json();
          const accessToken = data.access_token;

          openDB()
            .then((db) => {
              const transaction = db.transaction(
                OBJECT_STORE_NAME,
                "readwrite"
              );
              const store = transaction.objectStore(OBJECT_STORE_NAME);
              const request = store.get("accessToken");

              request.onsuccess = (event: any) => {
                const existingAccessToken = event.target.result;
                if (!existingAccessToken) {
                  if (accessToken) {
                    store.add({ id: "accessToken", value: accessToken });
                  }
                  setHaveAccessToken(true);
                }
              };

              transaction.oncomplete = () => {
                db.close();
              };
            })
            .catch((error) => {
              console.error("Error accessing IndexedDB:", error);
            });
        } catch (error) {
          console.error("Error fetching access token:", error);
        }
      };

      fetchAccessToken();
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Viserion</h1>
        {haveAccessToken ? (
          <>
            <h2>User Logged In</h2>
            <h3>This tab can be closed now</h3>
          </>
        ) : (
          <h2>Getting Access Token...</h2>
        )}
      </header>
    </div>
  );
};

export default App;
