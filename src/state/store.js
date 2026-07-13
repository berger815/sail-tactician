export function createStore(initialState) {
  let state = structuredClone(initialState);
  const listeners = new Set();
  return {
    getState: () => state,
    update(updater, event = 'state:update') {
      const next = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
      if (next === state) return state;
      state = next;
      listeners.forEach((listener) => listener(state, event));
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const initialState = {
  mode: 'start',
  navigation: { position: null, sog: null, cog: null, heading: null, accuracyMeters: null },
  wind: { direction: null, speed: null, source: null, observedAt: null },
  course: { pinA: null, pinB: null, marks: [], finish: null, activeMarkIndex: 0 },
  race: { status: 'idle', sequenceSeconds: 300, startedAt: null },
  solution: null,
};
