import '../index.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'dark',
        value: '#1f2937',
      },
    ],
  },
  docs: {
    source: {
      type: 'dynamic',
      excludeDecorators: true,
    },
  },
  layout: 'centered',
  themes: {
    default: 'light',
    list: [
      { name: 'light', class: 'light', color: '#ffffff' },
      { name: 'dark', class: 'dark', color: '#1f2937' },
    ],
  },
};

export const decorators = [
  (Story) => (
    <div className="p-4">
      <Story />
    </div>
  ),
];
