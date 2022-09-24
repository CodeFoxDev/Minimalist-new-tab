let options = {}
const storage = {
  clear: () => {
    chrome.storage.sync.clear(() => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  },
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
      callback(value[arr[0]]);
    });
  },
  getSync: async (arr) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(arr, (result) => {
        if (result[arr[0]] === undefined) {
          resolve(null);
        } else {
          resolve(result[arr[0]]);
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
    return {
      general: {
        googleUser: (await storage.getSync(['googleUser'])) ?? 0
      },
      clock: {
        style: (await storage.getSync(['clockStyle'])) ?? 24,
        precision: (await storage.getSync(['clockPrecision'])) ?? 'HH:MM',
        flicker: (await storage.getSync(['clockFlicker'])) ?? false,
      },
      appearance: {
        backgroundColor: (await storage.getSync(['backgroundColor'])) ?? '#12181b',
      }
    }
  },
  update: async () => {
    options = await storage.initializeSync();
  }
}

const clock = {
  lastTime: { h: '0', m: '0', s: '0' },
  element: document.querySelector(".time-display"),
  initialize: () => {
    clock.element = document.querySelector(".time-display")
  },
  update: () => {
    const date = new Date();
    var h = date.getHours().toString().padStart(2, '0'), m = date.getMinutes().toString().padStart(2, '0'), s = date.getSeconds().toString().padStart(2, '0');
    //Get daypart and change clockStyle
    const style = (options.clock.style == 12) ? ((h > 12) ? "PM" : "AM") : "";
    document.querySelector("#time-style").innerHTML = style;
    if (options.clock.style == 12) { h = (date.getHours() % 12).toString().padStart(2, '0'); }
    if (h == 0) { h = '12'; }
    //Change opacity if time at digit has changed
    if (options.clock.flicker) {
      h.charAt(0) != clock.lastTime.h.charAt(0) && (clock.element.querySelector("#hour1").style.opacity = 0);
      m.charAt(0) != clock.lastTime.m.charAt(0) && (clock.element.querySelector("#min1").style.opacity = 0);
      s.charAt(0) != clock.lastTime.s.charAt(0) && (clock.element.querySelector("#sec1").style.opacity = 0);
      h.charAt(1) != clock.lastTime.h.charAt(1) && (clock.element.querySelector("#hour2").style.opacity = 0);
      m.charAt(1) != clock.lastTime.m.charAt(1) && (clock.element.querySelector("#min2").style.opacity = 0);
      s.charAt(1) != clock.lastTime.s.charAt(1) && (clock.element.querySelector("#sec2").style.opacity = 0);
    }
    //Change animation value after delay
    setTimeout(() => {
      clock.element.querySelector("#hour1").innerHTML = h.charAt(0);
      clock.element.querySelector("#hour2").innerHTML = h.charAt(1);

      if (options.clock.precision.includes("MM")) {
        clock.element.querySelector("#min1").innerHTML = m.charAt(0);
        clock.element.querySelector("#min2").innerHTML = m.charAt(1);
        clock.element.querySelector("#point1").innerHTML = ":";
      } else {
        clock.element.querySelector("#min1").innerHTML = "";
        clock.element.querySelector("#min2").innerHTML = "";
        clock.element.querySelector("#point1").innerHTML = "";
      }
      if (options.clock.precision.includes("SS")) {
        clock.element.querySelector("#sec1").innerHTML = s.charAt(0);
        clock.element.querySelector("#sec2").innerHTML = s.charAt(1);
        clock.element.querySelector("#point2").innerHTML = ":";
      } else {
        clock.element.querySelector("#sec1").innerHTML = "";
        clock.element.querySelector("#sec2").innerHTML = "";
        clock.element.querySelector("#point2").innerHTML = "";
      }
      clock.element.querySelector("#hour1").style.opacity = 1;
      clock.element.querySelector("#min1").style.opacity = 1;
      clock.element.querySelector("#sec1").style.opacity = 1;
      clock.element.querySelector("#hour2").style.opacity = 1;
      clock.element.querySelector("#min2").style.opacity = 1;
      clock.element.querySelector("#sec2").style.opacity = 1;
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

    Object.keys(search.links.suffix).forEach(className => {
      const ele = document.querySelector("." + className);
      ele.href = search.links.prefix[className] + options.general.googleUser + search.links.suffix[className];
    });
  },
  update: () => {
    Object.keys(search.links.suffix).forEach(className => {
      const ele = document.querySelector("." + className);
      ele.href = search.links.prefix[className] + options.general.googleUser + search.links.suffix[className];
    });
  }
}
const appearance = {
  initialize: () => {
    document.body.style.backgroundColor = options.appearance.backgroundColor;
    document.querySelector('input[type=color]#backgroundColor').value = options.appearance.backgroundColor;
  },
  update: () => {
    document.body.style.background = options.appearance.backgroundColor;
    if (getContrastYIQ(options.appearance.backgroundColor)) {
      document.documentElement.style.setProperty("--contrast-text-color", "var(--gray5)");
      appearance.color = '--gray4';
    } else {
      document.documentElement.style.setProperty("--contrast-text-color", "var(--gray2)");
      appearance.color = '--gray2';
    }
  }
}

const initializeEventListeners = async () => {
  document.getElementById("options-switch").checked = false;
  //# Options menu animation
  const optionsSwitch = document.querySelector("input[type=checkbox]#options-switch");
  optionsSwitch.addEventListener('change', () => {
    const optionsMenu = document.querySelector('div.options-menu');
    const optionsParent = document.querySelector('div.options-parent');

    if (optionsSwitch.checked) {
      optionsMenu.classList.remove('closed');
      optionsParent.classList.remove('closed');

      optionsMenu.classList.add('open');
      optionsParent.classList.add('open');
    } else {
      optionsMenu.classList.remove('open');
      optionsParent.classList.remove('open');

      optionsMenu.classList.add('closed');
      optionsParent.classList.add('closed');
    }
  });
  //? General
  //# Default User
  const userInp = document.querySelector("#defaultUser");
  userInp.value = (await storage.getSync(['googleUser'])) ?? 0;
  userInp.addEventListener('input', async () => {
    if (userInp.value == options.general.googleUser) { return; }
    storage.set({ googleUser: userInp.value }, () => {
      options.general.googleUser = userInp.value;
    });
  });
  //# Clockstyle
  const clockStyle = document.querySelector("#clockStyle");
  clockStyle.value = (await storage.getSync(['clockStyle'])) ?? 24;
  clockStyle.addEventListener('change', () => {
    if (clockStyle.value == options.clock.style) { return; }
    storage.set({ clockStyle: clockStyle.value }, () => {
      options.clock.style = clockStyle.value;
    });
  });
  //# Clock precision
  const clockPrecision = document.querySelector('#clockPrecision');
  clockPrecision.value = (await storage.getSync(['clockPrecision'])) ?? 'HH:MM';
  clockPrecision.addEventListener('change', () => {
    if (clockPrecision.value == options.clock.precision) { return; }
    storage.set({ clockPrecision: clockPrecision.value }, () => {
      options.clock.precision = clockPrecision.value;
    });
  });
  //# Clock flicker
  const clockFlicker = document.querySelector('#clockFlicker');
  clockFlicker.checked = (await storage.getSync(['clockFlicker'])) ?? false;
  clockFlicker.addEventListener('change', () => {
    if (clockFlicker.checked == options.clock.flicker) { return; }
    storage.set({ clockFlicker: clockFlicker.checked }, () => {
      options.clock.flicker = clockFlicker.checked;
    });
  });
  //? Appearance
  //# Background color
  const backgroundColor = document.querySelector('input[type=color]#backgroundColor');
  backgroundColor.addEventListener('focusout', () => {
    if (backgroundColor.value == options.appearance.backgroundColor) { return; }
    storage.set({ backgroundColor: backgroundColor.value }, () => {
      options.appearance.backgroundColor = backgroundColor.value;
      document.body.style.backgroundColor = options.appearance.backgroundColor;
    });
  });
  const backgroundReset = document.querySelector('button#backgroundColorReset');
  backgroundReset.addEventListener('click', () => {
    storage.set({ backgroundColor: '#12181b' }, () => {
      options.appearance.backgroundColor = '#12181b';
      appearance.initialize();
    });
  });

  update();
}

const getContrastYIQ = (hexcolor) => {
  const hex = hexcolor.replace('#', '');
  const c_r = parseInt(hex.substr(0, 2), 16);
  const c_g = parseInt(hex.substr(2, 2), 16);
  const c_b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
  return brightness > 155;
}

const update = async () => {
  clock.update();
  search.update();
  appearance.update();
  storage.update();
}

window.onload = async () => {
  await storage.update();

  clock.initialize();
  search.initialize();
  appearance.initialize();

  initializeEventListeners();
  setInterval(update, 1e3);
};