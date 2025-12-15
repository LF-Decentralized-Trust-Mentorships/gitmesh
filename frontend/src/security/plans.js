/**
 * List of Plans
 */
class Plans {
  static get values() {
    return {
      essential: 'Essential',
      growth: 'Growth',
      enterprise: 'Enterprise',
      scale: 'Scale',
      signals: 'Signals',
    };
  }

  static get communityValues() {
    return {
      community: 'Community',
      custom: 'Custom',
    };
  }
}

export default Plans;
