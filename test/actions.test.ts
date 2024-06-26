import * as sessionReplay from '@amplitude/session-replay-browser';
import { Context } from '@segment/analytics-next';
import { updateSessionIdAndAddProperties } from '../src/actions';

import Cookie from 'js-cookie';

jest.mock('@amplitude/session-replay-browser');
const mockedSessionReplay = <jest.Mocked<typeof sessionReplay>>sessionReplay;

jest.mock('js-cookie');
const mockedCookieJS = <jest.Mocked<typeof Cookie>>Cookie;

describe('Segment Actions Wrapper', () => {
  const { getSessionReplayProperties, setSessionId } = mockedSessionReplay;
  // const { get, set } = cookie as MockedCookieJS;

  beforeEach(() => {
    setSessionId.mockReturnValue({
      promise: Promise.resolve(),
    });
  });
  describe('updateSessionIdAndAddProperties', () => {
    test('should update the session id', async () => {
      // @ts-ignore
      mockedCookieJS.get.mockReturnValueOnce('123');
      const updateEventMock = jest.fn();
      await updateSessionIdAndAddProperties({
        updateEvent: updateEventMock,
        event: {
          integrations: {
            'Actions Amplitude': {
              session_id: 130,
            },
          },
        },
      } as unknown as Context);
      expect(setSessionId).toHaveBeenCalledWith(130);
      expect(mockedCookieJS.set).toHaveBeenCalledWith('amp_session_id', '130');
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
            price: 3,
          },
          integrations: {
            'Actions Amplitude': {
              session_id: 130,
            },
          },
        },
      } as unknown as Context);
      expect(getSessionReplayProperties).toHaveBeenCalled();
      expect(updateEventMock).toHaveBeenCalledWith('properties', { '[Amplitude] Session Replay ID': 123, price: 3 });
    });
  });
});
