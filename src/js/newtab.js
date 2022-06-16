const searchQuery = "https://www.google.com/search?q=";
const linkIds = {
  drive: "/",
  gmail: "/",
  classroom: "/h",
  calendar: "/"
}
const links = {
  drive: "https://drive.google.com/drive/u/",
  gmail: "https://mail.google.com/mail/u/",
  classroom: "https://classroom.google.com/u/",
  calendar: "https://calendar.google.com/calendar/u/",
  translate: "https://translate.google.nl/"
}
let defaultGoogleUser = 0;
let defaultClockStyle = 24;

let lastTime = { h: '0', m: '0', s: '0' };

function showTime() {
  //Get date
  const date = new Date();
  //Get formatted date
  var h = (defaultClockStyle == 24) ? date.getHours().toString().padStart(2, '0') : (date.getHours() - 12).toString().padStart(2, '0')
  var m = date.getMinutes().toString().padStart(2, '0');
  var s = date.getSeconds().toString().padStart(2, '0');
  //Get clockstyle and daypart
  const style = (defaultClockStyle == 12) ? ((h > 12) ? "PM": "AM") : "";
  //Get clock element
  const clock = document.querySelector(".time-display");
  document.querySelector("#time-style").innerHTML = style;
  //Change opacity if changed
  h.charAt(0) != lastTime.h.charAt(0) && (clock.querySelector("#hour1").style.opacity = 0),
  m.charAt(0) != lastTime.m.charAt(0) && (clock.querySelector("#min1").style.opacity = 0),
  s.charAt(0) != lastTime.s.charAt(0) && (clock.querySelector("#sec1").style.opacity = 0),
  h.charAt(1) != lastTime.h.charAt(1) && (clock.querySelector("#hour2").style.opacity = 0),
  m.charAt(1) != lastTime.m.charAt(1) && (clock.querySelector("#min2").style.opacity = 0),
  s.charAt(1) != lastTime.s.charAt(1) && (clock.querySelector("#sec2").style.opacity = 0),
  //Change value after delay
  setTimeout(() => {
    (clock.querySelector("#hour1").innerHTML = h.charAt(0)),
    (clock.querySelector("#min1").innerHTML = m.charAt(0)),
    (clock.querySelector("#sec1").innerHTML = s.charAt(0)),
    (clock.querySelector("#hour2").innerHTML = h.charAt(1)),
    (clock.querySelector("#min2").innerHTML = m.charAt(1)),
    (clock.querySelector("#sec2").innerHTML = s.charAt(1)),
    (clock.querySelector("#hour1").style.opacity = 1),
    (clock.querySelector("#min1").style.opacity = 1),
    (clock.querySelector("#sec1").style.opacity = 1),
    (clock.querySelector("#hour2").style.opacity = 1),
    (clock.querySelector("#min2").style.opacity = 1),
    (clock.querySelector("#sec2").style.opacity = 1);
    }, 250),
    (lastTime = { h: h, m: m, s: s }),
    setTimeout(showTime, 1e3);
}
function populateLinks() {
  try {
    chrome.storage.local.get(['defaultuser'], (res) => {
      defaultGoogleUser = res.defaultuser;
      if(!defaultGoogleUser){ defaultGoogleUser = 0; }
      Object.keys(linkIds).forEach(className => {
        const ele = document.querySelector("."+className);
        ele.href = links[className] + defaultGoogleUser + linkIds[className];
      });
      document.querySelector("input[type=number]#defaultUser").value = parseInt(defaultGoogleUser);
    });
  } catch { console.log("Failed to access local storage, do you have the right version installed?"); }
  try {
    chrome.storage.local.get(['clockStyle'], (res) => {
      defaultClockStyle = res.clockStyle ?? 24;
      document.querySelector("#clockStyle").value = defaultClockStyle;
    });
  } catch { console.log("Failed to access local storage, do you have the right version installed?"); }
}
function setDefaultUser(user) {
  chrome.storage.local.set({ defaultuser: user }, () => {
    console.log('Changed default user to: ' + user);
    populateLinks();
  })
}
function setClockStyle(style) {
  chrome.storage.local.set({ clockStyle: style }, () => {
    console.log('Changed clock style to: ' + style);
    defaultClockStyle = style;
    populateLinks();
  })
}
function iniSearch() {
  const form = document.querySelector("form")
  form.querySelector("input").focus();
  form.querySelectorAll("input[type=radio]").forEach(element => {
    element.checked = false;
  });
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    window.location.replace(searchQuery + encodeURIComponent(form.querySelector("input").value));
  });
  form.querySelector("#type-images").addEventListener('click', (ev) => {
    window.location.replace("https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(form.querySelector("input").value));
  });
  form.querySelector("#type-posts").addEventListener('click', (ev) => {
    window.location.replace("https://news.google.com/search?q=" + encodeURIComponent(form.querySelector("input").value));
  });
  form.querySelector("#type-maps").addEventListener('click', (ev) => {
    window.location.replace("https://www.google.com/maps/search/" + encodeURIComponent(form.querySelector("input").value));
  });
}
function iniOptions(){
  const userInp = document.querySelector("input[type=number]#defaultUser");
  userInp.addEventListener('change', () => {
    if(userInp.value == defaultGoogleUser){ return; }
    setDefaultUser(userInp.value);
  });
  const clockInp = document.querySelector("#clockStyle");
  clockInp.addEventListener('change', () => {
    if(clockInp.value == defaultClockStyle){ return; }
    setClockStyle(clockInp.value);
  });
  document.getElementById("options-switch").checked = false;
}


window.onload = () => {
  showTime();
  iniSearch();
  populateLinks();
  iniOptions();
};
