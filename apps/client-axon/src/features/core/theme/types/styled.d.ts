import 'styled-components';
import type { AxonTheme } from './types';

declare module 'styled-components' {
  export interface DefaultTheme extends AxonTheme {}
}