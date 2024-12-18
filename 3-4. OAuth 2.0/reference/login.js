const kakaoLoginButton = document.querySelector("#kakao");
const naverLoginButton = document.querySelector("#naver");
const googleLoginButton = document.querySelector("#google");
const userImage = document.querySelector("img");
const userName = document.querySelector("#user_name");
const logoutButton = document.querySelector("#logout_button");

let currentOAuthService = "";

const kakaoClientId = "c06d2a1229f99f24c88fd566afd56a8d";
const redirectURI = "http://127.0.0.1:9000";
let kakaoAccessToken = "";

const naverClientId = "fXXDtd2cT5YeJ1ZIFNwx";
const naverClientSecret = "ttWs3YU2gY";
const naverSecret = "it_is_me";
let naverAccessToken = "";

const googleClientId = "AIzaSyBYInz5jVI5HC9bee4FFr_jTfrLhASik2A";
const googleClientSecret =
  "482846174129-saon8s0qgpadf0vniv5r2640a4m2g7ko.apps.googleusercontent.com";
let googleAccessToken = "";

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

googleLoginButton.onclick = () => {
  location.href = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${redirectURI}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile`;
};

window.onload = () => {
  const url = new URL(location.href);
  const urlParams = url.searchParams;
  const authorizationCode = urlParams.get("code");
  const naverState = urlParams.get("state");

  if (authorizationCode) {
    if (naverState) {
      axios
        .post("http://localhost:3000/naver/login", { authorizationCode })
        .then((res) => {
          naverAccessToken = res.data;
          return axios.post("http://localhost:3000/naver/userinfo", {
            naverAccessToken,
          });
        })
        .then((res) => {
          renderUserInfo(res.data.profile_image, res.data.name);
          currentOAuthService = "naver";
        });
    } else if (authorizationCode.includes("google")) {
      axios
        .post("http://localhost:3000/google/login", { authorizationCode })
        .then((res) => {
          googleAccessToken = res.data;
        });
    } else {
      axios
        .post("http://localhost:3000/kakao/login", { authorizationCode })
        .then((res) => {
          kakaoAccessToken = res.data;
          return axios.post("http://localhost:3000/kakao/userinfo", {
            kakaoAccessToken,
          });
        })
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
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
