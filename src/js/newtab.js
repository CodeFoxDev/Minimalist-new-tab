let options = {}
const storage = {
  set: (obj, callback) => {
    chrome.storage.sync.set(obj, () => {
      callback();
    });
  },
  setSync: async (obj) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(obj, () => {
        resolve(true);
      });
    });
  },
  get: (arr, callback) => {
    chrome.storage.sync.get(arr, (value) => {
      callback(value);
    });
  },
  getSync: async (arr) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(arr, (result) => {
        if (result[arr[0]] === undefined) {
          const obj = {}; obj[arr[0]] = null;
          resolve(obj);
        } else {
          resolve(result);
        }
      });
    });
  },
  initialize: (callback) => {
    storage.get(['googleUser'], (res) => {
      options.general.googleUser = res.googleUser ?? 0;
    });
    storage.get(['clockStyle'], (res) => {
      options.clock.style = res.clockStyle ?? 24;
    });
    storage.get(['clockPrecision'], (res) => {
      options.clock.precision = res.clockPrecision ?? 'HH:MM:SS';
    });
    storage.get(['clockFlicker'], (res) => {
      options.clock.flicker = res.flicker ?? false;
    });
  },
  initializeSync: async () => {
    const res = {
      general: {
        googleUser: await storage.getSync(['googleUser']).then(value => value.googleUser) ?? 0
      },
      clock: {
        style: await storage.getSync(['clockStyle']).then(value => value.clockStyle) ?? 24,
        precision: await storage.getSync(['clockPrecision']).then(value => value.clockPrecision) ?? 'HH:MM:SS',
        flicker: await storage.getSync(['clockFlicker']).then(value => value.clockFlicker) ?? false,
      }
    }
    return res;
  }
}
const clock = {
  lastTime: { h: '0', m: '0', s: '0' },
  update: () => {
    const date = new Date();
    var h = date.getHours().toString().padStart(2, '0'), m = date.getMinutes().toString().padStart(2, '0'), s = date.getSeconds().toString().padStart(2, '0');
    //Get daypart and change clockStyle
    const style = (options.clock.style == 12) ? ((h > 12) ? "PM" : "AM") : "";
    document.querySelector("#time-style").innerHTML = style;
    if (options.clock.style == 12) { h = (date.getHours() % 12).toString().padStart(2, '0'); }
    //Get clock element
    const clockEle = document.querySelector(".time-display");
    //Change opacity if time at digit has changed
    if (options.clock.flicker) {
      h.charAt(0) != clock.lastTime.h.charAt(0) && (clockEle.querySelector("#hour1").style.opacity = 0);
      m.charAt(0) != clock.lastTime.m.charAt(0) && (clockEle.querySelector("#min1").style.opacity = 0);
      s.charAt(0) != clock.lastTime.s.charAt(0) && (clockEle.querySelector("#sec1").style.opacity = 0);
      h.charAt(1) != clock.lastTime.h.charAt(1) && (clockEle.querySelector("#hour2").style.opacity = 0);
      m.charAt(1) != clock.lastTime.m.charAt(1) && (clockEle.querySelector("#min2").style.opacity = 0);
      s.charAt(1) != clock.lastTime.s.charAt(1) && (clockEle.querySelector("#sec2").style.opacity = 0);
    }
    //Change animation value after delay
    setTimeout(() => {
      clockEle.querySelector("#hour1").innerHTML = h.charAt(0);
      clockEle.querySelector("#hour2").innerHTML = h.charAt(1);

      if (options.clock.precision.includes("MM")) {
        clockEle.querySelector("#min1").innerHTML = m.charAt(0);
        clockEle.querySelector("#min2").innerHTML = m.charAt(1);
        clockEle.querySelector("#point1").innerHTML = ":";
      } else {
        clockEle.querySelector("#min1").innerHTML = "";
        clockEle.querySelector("#min2").innerHTML = "";
        clockEle.querySelector("#point1").innerHTML = "";
      }
      if (options.clock.precision.includes("SS")) {
        clockEle.querySelector("#sec1").innerHTML = s.charAt(0);
        clockEle.querySelector("#sec2").innerHTML = s.charAt(1);
        clockEle.querySelector("#point2").innerHTML = ":";
      } else {
        clockEle.querySelector("#sec1").innerHTML = "";
        clockEle.querySelector("#sec2").innerHTML = "";
        clockEle.querySelector("#point2").innerHTML = "";
      }
      clockEle.querySelector("#hour1").style.opacity = 1;
      clockEle.querySelector("#min1").style.opacity = 1;
      clockEle.querySelector("#sec1").style.opacity = 1;
      clockEle.querySelector("#hour2").style.opacity = 1;
      clockEle.querySelector("#min2").style.opacity = 1;
      clockEle.querySelector("#sec2").style.opacity = 1;
    }, 250)
    clock.lastTime = { h: h, m: m, s: s }
  }
}
const search = {
  urlRegExp: new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+"),
  query: "https://www.google.com/search?q=",
  links: {
    prefix: {
      drive: "https://drive.google.com/drive/u/",
      gmail: "https://mail.google.com/mail/u/",
      classroom: "https://classroom.google.com/u/",
      calendar: "https://calendar.google.com/calendar/u/",
      translate: "https://translate.google.nl/"
    },
    suffix: {
      drive: "/",
      gmail: "/",
      classroom: "/h",
      calendar: "/"
    }
  },
  form: document.querySelector("form"),
  initialize: () => {
      search.form = document.querySelector("form")
      search.form.querySelector("input").focus();
      search.form.querySelectorAll("input[type=radio]").forEach(element => {
        element.checked = false;
      });
      search.form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const string = search.form.querySelector("input").value;
        const rexExpResult = string.match(search.urlRegExp)
        if (rexExpResult) {
          if (rexExpResult["1"]) { window.location.replace(rexExpResult["0"]) }
          else { window.location.replace('http://' + rexExpResult["0"]) }
        } else { window.location.replace(search.query + encodeURIComponent(search.form.querySelector("input").value)); }
      });
      search.form.querySelector("#type-images").addEventListener('click', (ev) => {
        window.location.replace("https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(search.form.querySelector("input").value));
      });
      search.form.querySelector("#type-posts").addEventListener('click', (ev) => {
        window.location.replace("https://news.google.com/search?q=" + encodeURIComponent(search.form.querySelector("input").value));
      });
      search.form.querySelector("#type-maps").addEventListener('click', (ev) => {
        window.location.replace("https://www.google.com/maps/search/" + encodeURIComponent(search.form.querySelector("input").value));
      });

      Object.keys(search.links.prefix).forEach(className => {
        const ele = document.querySelector("." + className);
        ele.href = search.links.prefix[className] + options.general.googleUser + search.links.suffix[className];
      });
  }
}
const initializeEvents = async () => {
  document.getElementById("options-switch").checked = false;
  //# Options menu animation
  const optionsSwitch = document.querySelector("input[type=checkbox]#options-switch");
  optionsSwitch.addEventListener('change', () => {
    const optionsMenu = document.querySelector('div.options-menu');
    const optionsParent = document.querySelector('div.options-parent');
    const delay = 1500;

    if (optionsSwitch.checked) {
      optionsMenu.classList.remove('closed');
      optionsParent.classList.remove('closed');

      optionsMenu.style = `animation: options-open ${(delay / 1000).toString()}s ease forwards;`;
      optionsParent.style = `animation: options-open-clip-path ${(delay / 1000).toString()}s ease forwards;`;
      setTimeout(() => {
        optionsMenu.style = '';
        optionsParent.style = '';
        optionsMenu.classList.add('open');
        optionsParent.classList.add('open');
      }, delay);
    } else {
      optionsMenu.classList.remove('open');
      optionsParent.classList.remove('open');

      optionsMenu.style = `animation: options-open ${(delay / 1000).toString()}s ease forwards reverse;`;
      optionsParent.style = `animation: options-open-clip-path ${(delay / 1000).toString()}s ease forwards reverse;`;
      setTimeout(() => {
        optionsMenu.style = '';
        optionsParent.style = '';
        optionsMenu.classList.add('closed');
        optionsParent.classList.add('closed');
      }, delay);
    }
  });
  //# Default User
  const userInp = document.querySelector("input[type=number]#defaultUser");
  userInp.value = await storage.getSync(['googleUser']).then(value => value.googleUser) ?? 0;
  userInp.addEventListener('change', () => {
    if (userInp.value == options.general.googleUser) { return; }
    storage.set({ googleUser: userInp.value }, () => {
      options.general.googleUser = userInp.value;
    });
  });
  //# Clockstyle
  const clockStyle = document.querySelector("#clockStyle");
  clockStyle.value = await storage.getSync(['clockStyle']).then(value => value.clockStyle) ?? 24;
  clockStyle.addEventListener('change', () => {
    if (clockStyle.value == options.clock.style) { return; }
    storage.set({ clockStyle: clockStyle.value }, () => {
      options.clock.style = clockStyle.value;
    });
  });
  //# Clock precision
  const clockPrecision = document.querySelector('#clockPrecision');
  clockPrecision.value = await storage.getSync(['clockPrecision']).then(value => value.clockPrecision) ?? 'HH:MM:SS';
  clockPrecision.addEventListener('change', () => {
    if (clockPrecision.value == options.clock.precision) { return; }
    storage.set({ clockPrecision: clockPrecision.value }, () => {
      options.clock.precision = clockPrecision.value;
    });
  });
  //# Clock flicker
  const clockFlicker = document.querySelector('#clockFlicker');
  clockFlicker.checked = await storage.getSync(['clockFlicker']).then(value => value.clockFlicker) ?? false;
  clockFlicker.addEventListener('change', () => {
    if (clockFlicker.checked == options.clock.flicker) { return; }
    storage.set({ clockFlicker: clockFlicker.checked }, () => {
      options.clock.flicker = clockFlicker.checked;
    })
  });

  update();
}

const update = async () => {
  clock.update();
  options = await storage.initializeSync();
}

window.onload = async () => {
  options = await storage.initializeSync();
  search.initialize();
  initializeEvents();
  setInterval(update, 1e3);
};