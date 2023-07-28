import { SEND_TELEMETRY_EVENT } from '@storybook/core-events';
import { values } from './globals/runtime';
import { globals } from './globals/types';

const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

// Apply all the globals
getKeys(globals).forEach((key) => {
  (globalThis as any)[globals[key]] = values[key];
});

global.telemetry = (data) => {
  const channel = global.__STORYBOOK_ADDONS_CHANNEL__;
  channel.emit(SEND_TELEMETRY_EVENT, data);
};
