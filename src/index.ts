import { createSegmentActionsPlugin } from './actions';
import { PluginOptions } from './types';

const ampSRSegmentWrapper = (options: PluginOptions) => {
  return createSegmentActionsPlugin(options);
};

export default ampSRSegmentWrapper;
