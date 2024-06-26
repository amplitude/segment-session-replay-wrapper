import { LogLevel } from '@amplitude/analytics-types';
import * as sessionReplay from '@amplitude/session-replay-browser';
import { Context, Plugin } from '@segment/analytics-next';
import cookie from 'cookiejs';
import { AmplitudeIntegrationData, PluginOptions } from './types';

const getStoredSessionId = () => {
  const storedId = cookie.get('amp_session_id') as string;
  if (storedId) {
    return parseInt(storedId, 10);
  }
  return undefined;
};

export const updateSessionIdAndAddProperties = async (ctx: Context) => {
  const storedSessionId = getStoredSessionId() || 0;
  const amplitudeIntegrationData =
    ctx.event.integrations && (ctx.event.integrations['Actions Amplitude'] as AmplitudeIntegrationData);
  const nextSessionId = amplitudeIntegrationData?.session_id;
  if (nextSessionId && storedSessionId < nextSessionId) {
    cookie.set('amp_session_id', nextSessionId.toString());
    await sessionReplay.setSessionId(nextSessionId).promise;
  }

  const sessionReplayProperties = sessionReplay.getSessionReplayProperties();
  const properties = {
    ...ctx.event.properties,
    ...sessionReplayProperties,
  };
  ctx.updateEvent('properties', properties);
  return ctx;
};

export const createSegmentActionsPlugin = async ({
  amplitudeApiKey,
  segmentInstance,
  deviceId,
  sessionReplayOptions,
}: PluginOptions) => {
  const sessionReplayPlugin: Plugin = {
    name: 'Session Replay Events',
    type: 'enrichment',
    version: '1.0.0',

    isLoaded: () => true,
    load: async (_ctx, ajs) => {
      const user = ajs.user();
      const storedSessionId = getStoredSessionId();

      await sessionReplay.init(amplitudeApiKey, {
        sessionId: storedSessionId,
        deviceId: deviceId || (user.anonymousId() as string),
        logLevel: LogLevel.Debug,
        ...sessionReplayOptions,
      }).promise;
    },

    track: updateSessionIdAndAddProperties,

    page: updateSessionIdAndAddProperties,
  };

  await segmentInstance.register(sessionReplayPlugin);
};
