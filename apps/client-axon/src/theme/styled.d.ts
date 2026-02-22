import 'styled-components';
import { AxonTheme } from '../types/themeTypes'; 

declare module 'styled-components' {
  export interface DefaultTheme extends AxonTheme {}
}