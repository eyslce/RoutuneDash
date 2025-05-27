export type RoutuneAPIConfig = {
  baseURL: string;
  secret?: string;

  // metadata
  metaLabel?: string;
};

export type LogsAPIConfig = RoutuneAPIConfig & { logLevel: string };

export type RuleType = { id?: number; type?: string; payload?: string; proxy?: string };
