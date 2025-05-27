import { getURLAndInit } from 'src/misc/request-helper';
import { RoutuneGeneralConfig } from 'src/store/types';
import { RoutuneAPIConfig } from 'src/types';

const endpoint = '/configs';

export async function fetchConfigs(apiConfig: RoutuneAPIConfig) {
  const { url, init } = getURLAndInit(apiConfig);
  return await fetch(url + endpoint, init);
}

// TODO support PUT /configs
// req body
// { Path: string }

type RoutuneConfigPartial = Partial<RoutuneGeneralConfig>;
function configsPatchWorkaround(o: RoutuneConfigPartial) {
  if ('socks-port' in o) {
    o['socket-port'] = o['socks-port'];
  }
  return o;
}

export async function updateConfigs(apiConfig: RoutuneAPIConfig, o: RoutuneConfigPartial) {
  const { url, init } = getURLAndInit(apiConfig);
  const body = JSON.stringify(configsPatchWorkaround(o));
  return await fetch(url + endpoint, { ...init, body, method: 'PATCH' });
}
