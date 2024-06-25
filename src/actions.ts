import { LogLevel } from "@amplitude/analytics-types";
// @ts-ignore
import * as sessionReplay from "@amplitude/session-replay-browser";
// @ts-ignore
import { SessionReplayOptions } from "@amplitude/session-replay-browser";
import { AnalyticsBrowser, Plugin } from "@segment/analytics-next";
import cookie from 'cookiejs';
 
const getStoredSessionId = () => {
  const storedId = cookie.get("amp_session_id") as string;
  console.log('storedId', storedId)
  if (storedId) {
    return parseInt(storedId, 10);
  }
  return undefined
}

type AmplitudeIntegrationData = {
  session_id: number;
}

export const setupSegmentActions = async ({
  amplitudeApiKey,
  segmentInstance,
  sessionReplayOptions,
}: {
  amplitudeApiKey: string,
  segmentInstance: AnalyticsBrowser,
  sessionReplayOptions: SessionReplayOptions,
}) => {
  const sessionReplayPlugin: Plugin = {
    name: 'Session Replay Events',
    type: 'enrichment',
    version: '1.0.0',
  
    isLoaded: () => true,
    load:async (_ctx, ajs) => {
      const user = ajs.user()
      const storedSessionId = getStoredSessionId();
    
      await sessionReplay.init(amplitudeApiKey, {
        sessionId: storedSessionId,
        deviceId: user.anonymousId() as string,
        logLevel: LogLevel.Debug,
        ...sessionReplayOptions
      }).promise;
    },
  
    track: async (ctx) => {
      const storedSessionId = getStoredSessionId() || 0;
      const amplitudeIntegrationData = ctx.event.integrations && ctx.event.integrations["Actions Amplitude"] as AmplitudeIntegrationData;
      const nextSessionId = amplitudeIntegrationData?.session_id;
      console.log('nextSessionId', nextSessionId, 'storedSessionId', storedSessionId)
      if (nextSessionId && storedSessionId < nextSessionId) {
        cookie.set('amp_session_id', nextSessionId.toString());
        await sessionReplay.setSessionId(nextSessionId).promise;
      }

      // await sessionReplay.evaluateTargetingAndRecord({ event: ctx.event });
      const sessionReplayProperties = sessionReplay.getSessionReplayProperties();
      const properties = {
        ...ctx.event.properties,
        ...sessionReplayProperties
      }
      ctx.updateEvent('properties', properties)
      return ctx
    }
  }
  
  await segmentInstance.register(sessionReplayPlugin)
}
 