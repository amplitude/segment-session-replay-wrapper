import { SessionReplayOptions } from '@amplitude/session-replay-browser';
import { AnalyticsBrowser } from '@segment/analytics-next';

export interface PluginOptions {
  amplitudeApiKey: string;
  segmentInstance: AnalyticsBrowser;
  sessionReplayOptions: SessionReplayOptions;
  deviceId?: string;
}

export type AmplitudeIntegrationData = {
  session_id: number;
};
