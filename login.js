const kakaoLoginButton = document.querySelector("#kakao");
const naverLoginButton = document.querySelector("#naver");
const userImage = document.querySelector("img");
const userName = document.querySelector("#user_name");
const logoutButton = document.querySelector("#logout_button");

let currentOAuthService = "";

// CheckList
// 1. redirectURI를 본인의 라이브서버 포트번호로 설정했나요?
// 2. ClientId를 본인의 id로 설정했나요?

// 1. 카카오 로그인
// Redirect URI: 인가코드를 받을 주소 (다시 이동할 화면)
// kakaoClientId(REST API키) : 너네 소셜 로그인 좀 이용할게
const kakaoClientId = "54dd77b66b07a1d0dd29acb9d6ef20ff";
const redirectURI = "http://127.0.0.1:5501";
// 전역에서 사용하기 위해 밖에서 변수 지정
let kakaoAccessToken = "";

const naverClientId = "PkDXJ9zvt8vwYGKdG_HH";
const naverClientSecret = "8lfN_97RJu";
const naverSecret = "it_is_me";
let naverAccessToken = "";

function renderUserInfo(imgURL, name) {
  userImage.src = imgURL;
  userName.textContent = name;
}

kakaoLoginButton.onclick = () => {
  location.href = `	https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${redirectURI}&response_type=code`;
};

naverLoginButton.onclick = () => {
  location.href = `https://nid.naver.com/oauth2.0/authorize?client_id=${naverClientId}&response_type=code&redirect_uri=${redirectURI}&state=${naverSecret}`;
};
// state : 해당 client가 내가 소통하고 있는 클라이언트가 맞는지 확인하는 임의의 상태 값

// 페이지에 "처음 들어왔을 때" code에 담긴 값을 보내야 함
window.onload = () => {
  const url = new URL(location.href);
  const urlParams = url.searchParams;
  const authorizationCode = urlParams.get("code");
  const naverState = urlParams.get("state");

  if (authorizationCode) {
    if (naverState) {
      // 네이버 로그인 처리
      axios
        // 1. 서버에 인가코드를 담아 엑세스 토큰 요청
        .post("http://localhost:3000/naver/login", { authorizationCode })
        // 4. res: 서버에서 받아온 엑세스 토큰
        .then((res) => {
          naverAccessToken = res.data;
          // 5. 엑세스 토큰을 사용하여 서버에 유저정보 요청(POST)
          return axios.post("http://localhost:3000/naver/userinfo", {
            naverAccessToken,
          });
        })
        // 9. 서버로부터 전달받은 json 형식의 유저 정보를 사용하여 렌더링
        .then((res) => {
          renderUserInfo(res.data.profile_image, res.data.name);
          currentOAuthService = "naver";
        });
    } else {
      // 카카오 로그인 처리
      axios
        // 1. 서버에 인가코드를 담아 엑세스 토큰 요청
        .post("http://localhost:3000/kakao/login", { authorizationCode })
        // 4. res: 서버에서 받아온 엑세스 토큰
        .then((res) => {
          kakaoAccessToken = res.data;
          // 5. 엑세스 토큰을 사용하여 서버에 유저정보 요청(POST)
          return axios.post("http://localhost:3000/kakao/userinfo", {
            kakaoAccessToken,
          });
        })
        // 9. 서버로부터 전달받은 json 형식의 유저 정보를 사용하여 렌더링
        .then((res) => {
          renderUserInfo(res.data.profile_image, res.data.nickname);
          currentOAuthService = "kakao";
        });
    }
  }
};

logoutButton.onclick = () => {
  if (currentOAuthService === "kakao") {
    axios
      .delete("http://localhost:3000/kakao/logout", {
        data: { kakaoAccessToken },
      })
      .then((res) => {
        {
          console.log(res.data);
          renderUserInfo("", "");
        }
      });
  } else if (currentOAuthService === "naver") {
    axios
      .delete("http://localhost:3000/naver/logout", {
        data: { naverAccessToken },
      })
      .then((res) => {
        {
          console.log(res.data);
          renderUserInfo("", "");
        }
      });
  }
};
