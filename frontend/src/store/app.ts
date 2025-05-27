import { DispatchFn, GetStateFn, State, StateApp } from 'src/store/types';

import { RoutuneAPIConfig } from '$src/types';

import { loadState, saveState } from '../misc/storage';
import { debounce, trimTrailingSlash } from '../misc/utils';
import { fetchConfigs } from './configs';
import { closeModal } from './modals';

export const getRoutuneAPIConfig = (s: State) => {
  const idx = s.app.selectedRoutuneAPIConfigIndex;
  return s.app.routuneAPIConfigs[idx];
};
export const getSelectedRoutuneAPIConfigIndex = (s: State) => s.app.selectedRoutuneAPIConfigIndex;
export const getRoutuneAPIConfigs = (s: State) => s.app.routuneAPIConfigs;
export const getTheme = (s: State) => s.app.theme;
export const getSelectedChartStyleIndex = (s: State) => s.app.selectedChartStyleIndex;
export const getLatencyTestUrl = (s: State) => s.app.latencyTestUrl;
export const getCollapsibleIsOpen = (s: State) => s.app.collapsibleIsOpen;
export const getProxySortBy = (s: State) => s.app.proxySortBy;
export const getHideUnavailableProxies = (s: State) => s.app.hideUnavailableProxies;
export const getAutoCloseOldConns = (s: State) => s.app.autoCloseOldConns;
export const getLogStreamingPaused = (s: State) => s.app.logStreamingPaused;

const saveStateDebounced = debounce(saveState, 600);

function findRoutuneAPIConfigIndex(
  getState: GetStateFn,
  { baseURL, secret, metaLabel }: RoutuneAPIConfig
) {
  const arr = getRoutuneAPIConfigs(getState());
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    if (x.baseURL === baseURL && x.secret === secret && x.metaLabel === metaLabel) return i;
  }
}

export function addRoutuneAPIConfig(conf: RoutuneAPIConfig) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    const idx = findRoutuneAPIConfigIndex(getState, conf);
    // already exists
    if (idx) return;

    const RoutuneAPIConfig = { ...conf, addedAt: Date.now() };
    dispatch('addRoutuneAPIConfig', (s) => {
      s.app.routuneAPIConfigs.push(RoutuneAPIConfig);
    });
    // side effect
    saveState(getState().app);
  };
}

export function removeRoutuneAPIConfig(conf: RoutuneAPIConfig) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    const idx = findRoutuneAPIConfigIndex(getState, conf);
    dispatch('removeRoutuneAPIConfig', (s) => {
      s.app.routuneAPIConfigs.splice(idx, 1);
    });
    // side effect
    saveState(getState().app);
  };
}

export function selectRoutuneAPIConfig(conf: RoutuneAPIConfig) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    const idx = findRoutuneAPIConfigIndex(getState, conf);
    const curr = getSelectedRoutuneAPIConfigIndex(getState());
    if (curr !== idx) {
      dispatch('selectRoutuneAPIConfig', (s) => {
        s.app.selectedRoutuneAPIConfigIndex = idx;
      });
    }
    // side effect
    saveState(getState().app);

    // manual clean up is too complex
    // we just reload the app
    try {
      window.location.reload();
    } catch (err) {
      // ignore
    }
  };
}

// unused
export function updateRoutuneAPIConfig(conf: RoutuneAPIConfig) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    const RoutuneAPIConfig = conf;
    dispatch('appUpdateRoutuneAPIConfig', (s) => {
      s.app.routuneAPIConfigs[0] = RoutuneAPIConfig;
    });
    // side effect
    saveState(getState().app);
    dispatch(closeModal('apiConfig'));
    dispatch(fetchConfigs(RoutuneAPIConfig));
  };
}

const rootEl = document.querySelector('html');
type ThemeType = 'dark' | 'light' | 'auto';

function insertThemeColorMeta(color: string, media?: string) {
  const meta0 = document.createElement('meta');
  meta0.setAttribute('name', 'theme-color');
  meta0.setAttribute('content', color);
  if (media) meta0.setAttribute('media', media);
  document.head.appendChild(meta0);
}

function updateMetaThemeColor(theme: ThemeType) {
  const metas = Array.from(
    document.querySelectorAll('meta[name=theme-color]')
  ) as HTMLMetaElement[];
  let meta0: HTMLMetaElement;
  for (const m of metas) {
    if (!m.getAttribute('media')) {
      meta0 = m;
    } else {
      document.head.removeChild(m);
    }
  }

  if (theme === 'auto') {
    insertThemeColorMeta('#eeeeee', '(prefers-color-scheme: light)');
    insertThemeColorMeta('#202020', '(prefers-color-scheme: dark)');
    if (meta0) {
      document.head.removeChild(meta0);
    } else {
      return;
    }
  } else {
    const color = theme === 'light' ? '#eeeeee' : '#202020';
    if (!meta0) {
      insertThemeColorMeta(color);
    } else {
      meta0.setAttribute('content', color);
    }
  }
}

function setTheme(theme: ThemeType = 'dark') {
  if (theme === 'auto') {
    rootEl.setAttribute('data-theme', 'auto');
  } else if (theme === 'dark') {
    rootEl.setAttribute('data-theme', 'dark');
  } else {
    rootEl.setAttribute('data-theme', 'light');
  }
  updateMetaThemeColor(theme);
}

export function switchTheme(nextTheme = 'auto') {
  return (dispatch: DispatchFn, getState: GetStateFn) => {
    const currentTheme = getTheme(getState());
    if (currentTheme === nextTheme) return;
    // side effect
    setTheme(nextTheme as ThemeType);
    dispatch('storeSwitchTheme', (s) => {
      s.app.theme = nextTheme;
    });
    // side effect
    saveState(getState().app);
  };
}

export function selectChartStyleIndex(selectedChartStyleIndex: number | string) {
  return (dispatch: DispatchFn, getState: GetStateFn) => {
    dispatch('appSelectChartStyleIndex', (s) => {
      s.app.selectedChartStyleIndex = Number(selectedChartStyleIndex);
    });
    // side effect
    saveState(getState().app);
  };
}

export function updateAppConfig(name: string, value: unknown) {
  return (dispatch: DispatchFn, getState: GetStateFn) => {
    dispatch('appUpdateAppConfig', (s) => {
      s.app[name] = value;
    });
    // side effect
    saveState(getState().app);
  };
}

export function updateCollapsibleIsOpen(prefix: string, name: string, v: boolean) {
  return (dispatch: DispatchFn, getState: GetStateFn) => {
    dispatch('updateCollapsibleIsOpen', (s: State) => {
      s.app.collapsibleIsOpen[`${prefix}:${name}`] = v;
    });
    // side effect
    saveStateDebounced(getState().app);
  };
}

const defaultRoutuneAPIConfig = {
  baseURL: document.getElementById('app')?.getAttribute('data-base-url') ?? 'http://127.0.0.1:9090',
  secret: '',
  addedAt: 0,
};
// type Theme = 'light' | 'dark';
const defaultState: StateApp = {
  selectedRoutuneAPIConfigIndex: 0,
  routuneAPIConfigs: [defaultRoutuneAPIConfig],

  latencyTestUrl: 'http://www.gstatic.com/generate_204',
  selectedChartStyleIndex: 0,
  theme: 'dark',

  // type { [string]: boolean }
  collapsibleIsOpen: {},
  // how proxies are sorted in a group or provider
  proxySortBy: 'Natural',
  hideUnavailableProxies: false,
  autoCloseOldConns: false,
  logStreamingPaused: false,
};

function parseConfigQueryString() {
  const { search } = window.location;
  const collector: Record<string, string> = {};
  if (typeof search !== 'string' || search === '') return collector;
  const qs = search.replace(/^\?/, '').split('&');
  for (let i = 0; i < qs.length; i++) {
    const [k, v] = qs[i].split('=');
    collector[k] = encodeURIComponent(v);
  }
  return collector;
}

export function initialState() {
  let s = loadState();
  s = { ...defaultState, ...s };
  const query = parseConfigQueryString();

  const conf = s.routuneAPIConfigs[s.selectedRoutuneAPIConfigIndex];
  if (conf) {
    const url = new URL(conf.baseURL);
    if (query.hostname) {
      if (query.hostname.indexOf('http') === 0) {
        url.href = decodeURIComponent(query.hostname);
      } else {
        url.hostname = query.hostname;
      }
    }
    if (query.port) {
      url.port = query.port;
    }
    // url.href is a stringifier and it appends a trailing slash
    // that is not we want
    conf.baseURL = trimTrailingSlash(url.href);
    if (query.secret) {
      conf.secret = query.secret;
    }
  }

  if (query.theme === 'dark' || query.theme === 'light') {
    s.theme = query.theme;
  }
  // set initial theme
  setTheme(s.theme);
  return s;
}
