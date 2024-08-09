import * as sessionReplay from '@amplitude/session-replay-browser';
import { Context, Plugin } from '@segment/analytics-next';
import Cookie from 'js-cookie';
import { AmplitudeIntegrationData, PluginOptions } from './types';

const getStoredSessionId = () => {
  const storedId = Cookie.get('amp_session_id') as string;
  if (storedId) {
    return parseInt(storedId, 10);
  }
  return undefined;
};

const getUserId = (ctx: Context) => {
  const userId = ctx.event.userId || ctx.event.anonymousId;

  return userId as string;
};

export const updateSessionIdAndAddProperties = async (ctx: Context) => {
  const storedSessionId = getStoredSessionId() || 0;
  const amplitudeIntegrationData =
    ctx.event.integrations && (ctx.event.integrations['Actions Amplitude'] as AmplitudeIntegrationData);
  const nextSessionId = amplitudeIntegrationData?.session_id;
  if (nextSessionId && storedSessionId < nextSessionId) {
    Cookie.set('amp_session_id', nextSessionId.toString());
    const deviceId = getUserId(ctx);
    await sessionReplay.setSessionId(nextSessionId, deviceId).promise;
  }

  await sessionReplay.evaluateTargetingAndCapture({
    event: {
      event_type: ctx.event.event || '',
      event_properties: ctx.event.properties,
      time: ctx.event.timestamp instanceof Date ? ctx.event.timestamp.getTime() : undefined,
    },
    userProperties: ctx.event.traits,
  });
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
  sessionReplayOptions,
  segmentInstance,
}: PluginOptions) => {
  let initPromise: Promise<void>;
  const sessionReplayPlugin: Plugin = {
    name: 'Session Replay Events',
    type: 'enrichment',
    version: '1.0.0',

    isLoaded: () => true,
    load: async (_ctx, ajs) => {
      const user = ajs.user();
      const deviceId = user.anonymousId();
      const storedSessionId = getStoredSessionId();
      initPromise = sessionReplay.init(amplitudeApiKey, {
        ...sessionReplayOptions,
        sessionId: storedSessionId,
        deviceId: deviceId || undefined,
        userProperties: user.traits(),
      }).promise;
    },

    track: async (ctx) => {
      await initPromise;
      return await updateSessionIdAndAddProperties(ctx);
    },

    page: async (ctx) => {
      await initPromise;
      return await updateSessionIdAndAddProperties(ctx);
    },

    identify: async (ctx) => {
      await initPromise;
      const deviceId = getUserId(ctx);
      const sessionId = sessionReplay.getSessionId();
      sessionId && (await sessionReplay.setSessionId(sessionId, deviceId).promise);

      await sessionReplay.evaluateTargetingAndCapture({ userProperties: ctx.event.traits });

      return ctx;
    },
  };

  await segmentInstance.register(sessionReplayPlugin);
};
