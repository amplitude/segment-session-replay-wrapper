import * as sessionReplay from '@amplitude/session-replay-browser';
import { Context } from '@segment/analytics-next';
import { updateSessionIdAndAddProperties } from '../src/actions';

import * as cookie from 'cookiejs';

jest.mock('@amplitude/session-replay-browser');
type MockedSessionReplay = jest.Mocked<typeof import('@amplitude/session-replay-browser')>;

jest.mock('cookie-js');
type MockedCookieJS = jest.Mocked<typeof import('cookiejs')>;

describe('Segment Actions Wrapper', () => {
  const { getSessionReplayProperties, setSessionId } = sessionReplay as MockedSessionReplay;
  const { default } = cookie as MockedCookieJS;
  const { get, set}  = default;

  beforeEach(() => {
    getSessionReplayProperties.mockReturnValueOnce;
  });
  describe('updateSessionIdAndAddProperties', () => {
    test('should update the session id', async () => {
      get.mockReturnValueOnce('123');
      await updateSessionIdAndAddProperties({
        event: {
          integrations: {
            'Actions Amplitude': {
              session_id: 130,
            },
          },
        },
      } as unknown as Context);
      expect(setSessionId).toHaveBeenCalledWith(130);
      expect(set).toHaveBeenCalledWith(130)
    });
    test('should pass session replay properties on the event', async () => {
      getSessionReplayProperties.mockReturnValueOnce({
        // @ts-ignore;
        '[Amplitude] Session Replay ID': 123,
      });
      const updateEventMock = jest.fn();
      await updateSessionIdAndAddProperties({
        updateEvent: updateEventMock,
        event: {
          properties: {
            price: 3
          },
          integrations: {
            'Actions Amplitude': {
              session_id: 130,
            },
          },
        },
      } as unknown as Context);
      expect(getSessionReplayProperties).toHaveBeenCalled();
      expect(updateEventMock).toHaveBeenCalledWith({})
    });
  });
});
