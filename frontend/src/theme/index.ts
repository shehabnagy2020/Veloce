import { createTheme } from '@mantine/core';

const veroceBlack = [
  '#0B0E14',
  '#12151C',
  '#191D26',
  '#20252F',
  '#272D38',
  '#2E3441',
  '#353C4A',
  '#3C4453',
  '#434C5C',
  '#4A5465',
];

export const veloceTheme = createTheme({
  primaryColor: 'blue',
  colors: {
    'veloce-black': veroceBlack,
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '700',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

export const veloceGlobalStyles = {
  body: {
    backgroundColor: '#0B0E14',
    color: '#E1E4EA',
  },
};