<p align="center">
  <a href="https://amplitude.com" target="_blank" align="center">
    <img src="https://static.amplitude.com/lightning/46c85bfd91905de8047f1ee65c7c93d6fa9ee6ea/static/media/amplitude-logo-with-text.4fb9e463.svg" width="280">
  </a>
  <br />
</p>

# @amplitude/segment-session-replay-wrapper

This package is a wrapper to facilitate a one-line integration between Segment and [Amplitude's Session Replay SDK](https://amplitude.com/docs/session-replay/session-replay-standalone-sdk). This package currently only supports the [Segment Amplitude (Actions) destination](https://segment.com/docs/connections/destinations/catalog/actions-amplitude/).

## Installation

This package is published on NPM registry and is available to be installed using npm and yarn. Amplitude's Session
Replay SDK is included in this package, and does not need to be installed separately.

```sh
# npm
npm install @amplitude/segment-session-replay-wrapper" --save

# yarn
yarn add @amplitude/segment-session-replay-wrapper"
```

## Usage

```typescript
import { AnalyticsBrowser } from '@segment/analytics-next';
import setupAmpSRSegmentWrapper from '@amplitude/segment-session-replay-wrapper';

export const SegmentAnalytics = AnalyticsBrowser.load({
  writeKey: SEGMENT_API_KEY,
});

setupAmpSRSegmentWrapper({
  segmentInstance: SegmentAnalytics,
  amplitudeApiKey: AMPLITUDE_API_KEY,
  sessionReplayOptions: {
    logLevel: 4,
    sampleRate: 1,
    debugMode: true,
  },
});
```

The `sessionReplayOptions` parameter properties match those documented for the [Session Replay Standalone SDK](https://amplitude.com/docs/session-replay/session-replay-standalone-sdk#configuration). 

## Segment Plugin Architecture

This wrapper makes use of Segment's plugin architecture, which ensures that all `track` and `page` events are decorated
with the Session Replay ID event property.

## User ID to Device ID mapping

Following Segment's documentation, the wrapper maps the Segment user id to the Amplitude device id. To determine the
device id for session replay captures, the wrapper first checks if `userId` is set, if not, `anonymousId` is used.
