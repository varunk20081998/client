import React, { useState, useEffect } from "react";
import axios from "axios";
function useAuth(code) {
  const [access_token, setAccessToken] = useState();
  const [refresh_token, setRefreshToken] = useState();
  const [expires_in, setExpiresIn] = useState();

  useEffect(() => {
    axios
      .post("http://localhost:8000/login", {
        code,
      })
      .then((res) => {
        console.log(res.data);
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
        window.history.pushState({}, null, "/");
      })
      .catch((e) => {
        window.location = "/";
        console.log(e);
      });
  }, [code]);
  useEffect(() => {
    if (!refresh_token || !expires_in) return;
    const interval = setInterval(() => {
      axios
        .post("http://localhost:8000/refresh", {
          refreshToken: refresh_token,
        })
        .then((res) => {
          setAccessToken(res.data.accessToken);
          // setRefreshToken(res.data.refreshToken);
          setExpiresIn(res.data.expiresIn);
          // window.history.pushState({}, null, "/");
        })
        .catch((e) => {
          window.location = "/";
          console.log(e);
        });
    }, (expires_in - 60) * 1000);
    return () => clearInterval(interval);
  }, [refresh_token, expires_in]);

  return access_token;
}

export default useAuth;
