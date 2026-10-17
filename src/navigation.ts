import { NAV_SCREENS } from './theme';
import { Screen } from './types';

export interface NavState {
  screen: Screen;
  history: Screen[]; // screens to return to, most recent last
}

export type NavAction =
  | { type: 'push'; screen: Screen } // open a screen on top of the current one
  | { type: 'go'; screen: Screen } // jump to a screen, clearing history (tabs)
  | { type: 'back' };

// Where Back leads from `state`, or null when Back should leave the app
// (on Home or onboarding with nothing to go back to).
export function backTarget(state: NavState): NavState | null {
  if (state.history.length > 0) {
    return { screen: state.history[state.history.length - 1], history: state.history.slice(0, -1) };
  }
  if (state.screen !== 'home' && state.screen !== 'onboarding' && NAV_SCREENS.includes(state.screen)) {
    return { screen: 'home', history: [] };
  }
  return null;
}

export function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'push':
      if (action.screen === state.screen) return state;
      return { screen: action.screen, history: [...state.history, state.screen] };
    case 'go':
      return { screen: action.screen, history: [] };
    case 'back':
      // The in-app back buttons should always land somewhere; Home is the floor.
      return backTarget(state) ?? (state.screen === 'home' ? state : { screen: 'home', history: [] });
  }
}
