const express = require("express");
const cors = require("cors");
const axios = require("axios");

const kakaoClientId = "54dd77b66b07a1d0dd29acb9d6ef20ff";
const redirectURI = "http://127.0.0.1:5501";

const naverClientId = "PkDXJ9zvt8vwYGKdG_HH";
const naverClientSecret = "8lfN_97RJu";
const naverSecret = "it_is_me";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5501", "http://127.0.0.1:5501"],
    methods: ["OPTIONS", "POST", "DELETE"],
  })
);

app.use(express.json());

// 카카오 로그인 요청
app.post("/kakao/login", (req, res) => {
  // 2. 클라이언트에서 인가코드를 받아온 후 네이버 인증 서버에 토큰 요청 (POST)
  const authorizationCode = req.body.authorizationCode;
  axios
    .post(
      "https://kauth.kakao.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: kakaoClientId,
        redirect_uri: redirectURI,
        code: authorizationCode,
      },
      {
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    )
    // 3. 인가코드를 전송하여 받은 엑세스 토큰을 클라이언트 응답으로 전송
    .then((response) => res.send(response.data.access_token));
});

// 네이버 사용자 정보 요청
app.post("/naver/login", (req, res) => {
  // 2. 클라이언트에서 인가코드를 받아온 후 네이버 인증 서버에 토큰 요청 (POST)
  const authorizationCode = req.body.authorizationCode;
  axios
    .post(
      `https://nid.naver.com/oauth2.0/token?client_id=${naverClientId}&client_secret=${naverClientSecret}&grant_type=authorization_code&state=${naverSecret}&code=${authorizationCode}`
    )
    // 3. 인가코드를 전송하여 받은 엑세스 토큰을 클라이언트 응답으로 전송
    .then((response) => res.send(response.data.access_token));
});

// 카카오 사용자 정보 요청

// 6. 클라이언트가 엑세스 토큰과 함께 요청한 유저정보 요청
app.post("/kakao/userinfo", (req, res) => {
  const { kakaoAccessToken } = req.body;
  // 7. 클라이언트로부터 전달받은 엑세스 토큰을 사용해 인증 서버(네이버)에 토큰을 담아 사용자 정보 요청
  axios
    .get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    })
    // 8. 전달받은 사용자 정보를 json 형식으로 클라이언트에게 전송
    .then((response) => res.json(response.data.properties));
});

// 네이버 사용자 정보 요청

// 6. 클라이언트가 엑세스 토큰과 함께 요청한 유저정보 요청
app.post("/naver/userinfo", (req, res) => {
  const { naverAccessToken } = req.body;
  // 7. 클라이언트로부터 전달받은 엑세스 토큰을 사용해 인증 서버(네이버)에 토큰을 담아 사용자 정보 요청
  axios
    .get("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${naverAccessToken}`,
      },
    })
    // 8. 전달받은 사용자 정보를 json 형식으로 클라이언트에게 전송
    .then((response) => res.json(response.data.response));
});

app.delete("/kakao/logout", (req, res) => {
  const { kakaoAccessToken } = req.body;
  axios
    .post(
      "https://kapi.kakao.com/v1/user/logout",
      {},
      {
        headers: { Authorization: `Bearer ${kakaoAccessToken}` },
      }
    )
    .then((response) => res.send("로그아웃 성공"));
});

app.delete("/naver/logout", (req, res) => {
  const { naverAccessToken } = req.body;
  axios
    .post(
      `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${naverClientId}&client_secret=${naverClientSecret}&access_token=${naverAccessToken}&service_provider=NAVER`
    )
    .then((response) => res.send("로그아웃 성공"));
});

app.listen(3000, () => console.log("서버 열림!"));
