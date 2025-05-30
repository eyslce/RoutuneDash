import { atom } from 'recoil';
import {
  DelayMapping,
  DispatchFn,
  FormattedProxyProvider,
  GetStateFn,
  LatencyHistory,
  ProxiesMapping,
  ProxyItem,
  ProxyProvider,
  State,
  StateProxies,
  SwitchProxyCtxItem,
} from 'src/store/types';
import { RoutuneAPIConfig } from 'src/types';

import * as connAPI from '../api/connections';
import * as proxiesAPI from '../api/proxies';
import { getAutoCloseOldConns, getLatencyTestUrl } from './app';

export const initialState: StateProxies = {
  proxies: {},
  delay: {},
  groupNames: [],
  showModalClosePrevConns: false,
};

const noop = () => null;

export const NonProxyTypes = [
  'Direct',
  'Reject',
  'Relay',
  'Selector',
  'Fallback',
  'URLTest',
  'LoadBalance',
  'Unknown',
];

export const getProxies = (s: State) => s.proxies.proxies;
export const getDelay = (s: State) => s.proxies.delay;
export const getProxyGroupNames = (s: State) => s.proxies.groupNames;
export const getProxyProviders = (s: State) => s.proxies.proxyProviders || [];
export const getDangleProxyNames = (s: State) => s.proxies.dangleProxyNames;
export const getShowModalClosePrevConns = (s: State) => s.proxies.showModalClosePrevConns;

function mapLatency(names: string[], getProxy: (name: string) => { history: LatencyHistory }) {
  const result: DelayMapping = {};
  for (const name of names) {
    const p = getProxy(name) || { history: [] };
    const history = p.history;
    const h = history[history.length - 1];
    if (h && typeof h.delay === 'number') {
      result[name] = { number: h.delay };
    }
  }
  return result;
}

export function fetchProxies(apiConfig: RoutuneAPIConfig) {
  return async (dispatch: any, getState: any) => {
    const [proxiesData, providersData] = await Promise.all([
      proxiesAPI.fetchProxies(apiConfig),
      proxiesAPI.fetchProviderProxies(apiConfig),
    ]);

    const { proxyProviders, providerProxyRecord } = formatProxyProviders(providersData.providers);

    const proxies = { ...providerProxyRecord, ...proxiesData.proxies };
    const [groupNames, proxyNames] = retrieveGroupNamesFrom(proxies);

    const delayNext = {
      ...getDelay(getState()),
      ...mapLatency(Object.keys(proxies), (name) => proxies[name]),
    };

    // proxies that are not from a provider
    const dangleProxyNames = [];
    for (const v of proxyNames) {
      if (!providerProxyRecord[v]) dangleProxyNames.push(v);
    }

    dispatch('store/proxies#fetchProxies', (s: State) => {
      s.proxies.proxies = proxies;
      s.proxies.groupNames = groupNames;
      s.proxies.dangleProxyNames = dangleProxyNames;
      s.proxies.delay = delayNext;
      s.proxies.proxyProviders = proxyProviders;
    });
  };
}

export function updateProviderByName(apiConfig: RoutuneAPIConfig, name: string) {
  return async (dispatch: DispatchFn) => {
    try {
      await proxiesAPI.updateProviderByName(apiConfig, name);
    } catch (x) {
      // ignore
    }
    // should be optimized
    // but ¯\_(ツ)_/¯
    dispatch(fetchProxies(apiConfig));
  };
}

export function updateProviders(apiConfig: RoutuneAPIConfig, names: string[]) {
  return async (dispatch: DispatchFn) => {
    for (let i = 0; i < names.length; i++) {
      try {
        await proxiesAPI.updateProviderByName(apiConfig, names[i]);
      } catch (x) {
        // ignore
      }
    }
    // should be optimized
    // but ¯\_(ツ)_/¯
    dispatch(fetchProxies(apiConfig));
  };
}

async function healthcheckProviderByNameInternal(apiConfig: RoutuneAPIConfig, name: string) {
  try {
    await proxiesAPI.healthcheckProviderByName(apiConfig, name);
  } catch (x) {
    // ignore
  }
}

export function healthcheckProviderByName(apiConfig: RoutuneAPIConfig, name: string) {
  return async (dispatch: DispatchFn) => {
    await healthcheckProviderByNameInternal(apiConfig, name);
    // should be optimized
    // but ¯\_(ツ)_/¯
    await dispatch(fetchProxies(apiConfig));
  };
}

async function closeGroupConns(
  apiConfig: RoutuneAPIConfig,
  groupName: string,
  exceptionItemName: string
) {
  const res = await connAPI.fetchConns(apiConfig);
  if (!res.ok) {
    console.log('unable to fetch all connections', res.statusText);
    /* throw new Error(); */
  }
  const json = await res.json();
  const connections = json.connections;
  const idsToClose = [];
  for (const conn of connections) {
    if (
      // include the groupName
      conn.chains.indexOf(groupName) > -1 &&
      // but not include the itemName
      conn.chains.indexOf(exceptionItemName) < 0
    ) {
      idsToClose.push(conn.id);
    }
  }

  await Promise.all(idsToClose.map((id) => connAPI.closeConnById(apiConfig, id).catch(noop)));
}

function resolveChain(proxies: ProxiesMapping, groupName: string, itemName: string) {
  const chain = [itemName, groupName];

  let child: ProxyItem;
  let childKey = itemName;
  while ((child = proxies[childKey]) && child.now) {
    chain.unshift(child.now);
    childKey = child.now;
  }
  return chain;
}

async function switchProxyImpl(
  dispatch: DispatchFn,
  getState: GetStateFn,
  apiConfig: RoutuneAPIConfig,
  groupName: string,
  itemName: string
) {
  try {
    const res = await proxiesAPI.requestToSwitchProxy(apiConfig, groupName, itemName);
    if (res.ok === false) {
      throw new Error(`failed to switch proxy: res.statusText`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err, 'failed to swith proxy');
    throw err;
  }

  dispatch(fetchProxies(apiConfig));
  const autoCloseOldConns = getAutoCloseOldConns(getState());
  if (autoCloseOldConns) {
    // use fresh state
    const proxies = getProxies(getState());
    // no wait
    closePrevConns(apiConfig, proxies, { groupName, itemName });
  }
}

function closeModalClosePrevConns() {
  return (dispatch: DispatchFn) => {
    dispatch('closeModalClosePrevConns', (s: State) => {
      s.proxies.showModalClosePrevConns = false;
    });
  };
}

function closePrevConns(
  apiConfig: RoutuneAPIConfig,
  proxies: ProxiesMapping,
  switchTo: SwitchProxyCtxItem
) {
  // we must have fetched the proxies before
  // so the proxies here is fresh
  /* const proxies = s.proxies.proxies; */
  const chain = resolveChain(proxies, switchTo.groupName, switchTo.itemName);
  closeGroupConns(apiConfig, switchTo.groupName, chain[0]);
}

function closePrevConnsAndTheModal(apiConfig: RoutuneAPIConfig) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    const s = getState();
    const switchTo = s.proxies.switchProxyCtx?.to;
    if (!switchTo) {
      dispatch(closeModalClosePrevConns());
      return;
    }

    // we must have fetched the proxies before
    // so the proxies here is fresh
    const proxies = s.proxies.proxies;
    closePrevConns(apiConfig, proxies, switchTo);

    dispatch('closePrevConnsAndTheModal', (s: State) => {
      s.proxies.showModalClosePrevConns = false;
      s.proxies.switchProxyCtx = undefined;
    });
  };
}

export function switchProxy(apiConfig: RoutuneAPIConfig, groupName: string, itemName: string) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    // switch proxy asynchronously
    switchProxyImpl(dispatch, getState, apiConfig, groupName, itemName).catch(noop);

    // optimistic UI update
    dispatch('store/proxies#switchProxy', (s) => {
      const proxies = s.proxies.proxies;
      if (proxies[groupName] && proxies[groupName].now) {
        proxies[groupName].now = itemName;
      }
    });
  };
}

function requestDelayForProxyOnce(apiConfig: RoutuneAPIConfig, name: string) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    const latencyTestUrl = getLatencyTestUrl(getState());
    const res = await proxiesAPI.requestDelayForProxy(apiConfig, name, latencyTestUrl);
    let error = '';
    if (res.ok === false) {
      error = res.statusText;
    }
    const { delay } = await res.json();
    const delayNext = { ...getDelay(getState()), [name]: { error, number: delay } };

    dispatch('requestDelayForProxyOnce', (s) => {
      s.proxies.delay = delayNext;
    });
  };
}

export function requestDelayForProxy(apiConfig: RoutuneAPIConfig, name: string) {
  return async (dispatch: DispatchFn) => {
    await dispatch(requestDelayForProxyOnce(apiConfig, name));
  };
}

export function requestDelayForProxies(apiConfig: RoutuneAPIConfig, names: string[]) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    const proxies = getProxies(getState());
    const latencyTestUrl = getLatencyTestUrl(getState());

    const proxyDedupMap = new Map<string, boolean>();
    const providerDedupMap = new Map<string, boolean>();

    const works = names.map((name) => {
      const p = proxies[name];
      if (!p.__provider) {
        if (proxyDedupMap.get(name)) {
          return undefined;
        } else {
          proxyDedupMap.set(name, true);
          return proxiesAPI.requestDelayForProxy(apiConfig, name, latencyTestUrl);
        }
      } else if (p.__provider) {
        // this one is from a proxy provider
        if (providerDedupMap.get(p.__provider)) {
          return undefined;
        } else {
          providerDedupMap.set(p.__provider, true);
          return healthcheckProviderByNameInternal(apiConfig, p.__provider);
        }
      } else {
        return undefined;
      }
    });
    await Promise.all(works);
    await dispatch(fetchProxies(apiConfig));
  };
}

export function requestDelayAll(apiConfig: RoutuneAPIConfig) {
  return async (dispatch: DispatchFn, getState: GetStateFn) => {
    const proxyNames = getDangleProxyNames(getState());
    const latencyTestUrl = getLatencyTestUrl(getState());
    await Promise.all(
      proxyNames.map((p) => proxiesAPI.requestDelayForProxy(apiConfig, p, latencyTestUrl))
    );
    const proxyProviders = getProxyProviders(getState());
    // one by one
    for (const p of proxyProviders) {
      await healthcheckProviderByNameInternal(apiConfig, p.name);
    }
    await dispatch(fetchProxies(apiConfig));
  };
}

function retrieveGroupNamesFrom(proxies: Record<string, ProxyItem>) {
  let groupNames = [];
  let globalAll: string[];
  const proxyNames = [];
  for (const prop in proxies) {
    const p = proxies[prop];
    if (p.all && Array.isArray(p.all)) {
      groupNames.push(prop);
      if (prop === 'GLOBAL') {
        globalAll = Array.from(p.all);
      }
    } else if (NonProxyTypes.indexOf(p.type) < 0) {
      proxyNames.push(prop);
    }
  }
  if (globalAll) {
    // Put GLOBAL in the end
    globalAll.push('GLOBAL');
    // Sort groups according to its index in GLOBAL group
    groupNames = groupNames
      .map((name) => [globalAll.indexOf(name), name])
      .sort((a, b) => a[0] - b[0])
      .map((group) => group[1]);
  }
  return [groupNames, proxyNames];
}

type ProvidersRaw = {
  [key: string]: ProxyProvider;
};

function formatProxyProviders(providersInput: ProvidersRaw): {
  proxyProviders: Array<FormattedProxyProvider>;
  providerProxyRecord: ProxiesMapping;
} {
  const keys = Object.keys(providersInput);
  const proxyProviders = [];
  const providerProxyRecord: ProxiesMapping = {};

  for (let i = 0; i < keys.length; i++) {
    const provider: ProxyProvider = providersInput[keys[i]];
    if (provider.name === 'default' || provider.vehicleType === 'Compatible') {
      continue;
    }
    const proxiesArr = provider.proxies;
    const names = [];
    for (let j = 0; j < proxiesArr.length; j++) {
      const proxy = proxiesArr[j];
      providerProxyRecord[proxy.name] = { ...proxy, __provider: provider.name };
      names.push(proxy.name);
    }

    // mutate directly
    provider.proxies = names;
    proxyProviders.push(provider);
  }

  return { proxyProviders, providerProxyRecord };
}

export const actions = {
  requestDelayForProxies,
  closeModalClosePrevConns,
  closePrevConnsAndTheModal,
};

export const proxyFilterText = atom({
  key: 'proxyFilterText',
  default: '',
});
