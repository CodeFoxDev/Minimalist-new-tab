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
          reject();
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
    return {
      general: {
        googleUser: await storage.getSync(['googleUser']).then(value => value.googleUser)
      },
      clock: {
        style: await storage.getSync(['clockStyle']).then(value => value.clockStyle),
        precision: await storage.getSync(['clockPrecision']).then(value => value.clockPrecision),
        flicker: await storage.getSync(['clockFlicker']).then(value => value.clockFlicker),
      }
    }
  }
}

async function initializeEventListeners() {
  //# Default User
  const userInp = document.querySelector("input[type=number]#defaultUser");
  userInp.value = await storage.getSync(['googleUser']).then(value => value.googleUser);
  console.log(userInp.value);
  userInp.addEventListener('change', () => {
    if (userInp.value == options.general.googleUser) { return; }
    storage.set({ googleUser: userInp.value }, () => {
      options.general.googleUser = userInp.value;
    });
  });
  //# Clockstyle
  const clockStyle = document.querySelector("#clockStyle");
  clockStyle.value = await storage.getSync(['clockStyle']).then(value => value.clockStyle);
  clockStyle.addEventListener('change', () => {
    if (clockStyle.value == options.clock.style) { return; }
    storage.set({ clockStyle: clockStyle.value }, () => {
      options.clock.style = clockStyle.value;
    });
  });
  //# Clock precision
  const clockPrecision = document.querySelector('#clockPrecision');
  clockPrecision.value = await storage.getSync(['clockPrecision']).then(value => value.clockPrecision);
  clockPrecision.addEventListener('change', () => {
    if (clockPrecision.value == options.clock.precision) { return; }
    storage.set({ clockPrecision: clockPrecision.value }, () => {
      options.clock.precision = clockPrecision.value;
    });
  });
  //# Clock flicker
  const clockFlicker = document.querySelector('#clockFlicker');
  clockFlicker.checked = await storage.getSync(['clockFlicker']).then(value => value.clockFlicker);
  clockFlicker.addEventListener('change', () => {
    if (clockFlicker.checked == options.clock.flicker) { return; }
    storage.set({ clockFlicker: clockFlicker.checked }, () => {
      options.clock.flicker = clockFlicker.checked;
    })
  });
}


window.onload = async () => {
  //? Initialize elements
  options = await storage.initializeSync();
  initializeEventListeners();
};
