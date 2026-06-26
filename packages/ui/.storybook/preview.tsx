import type { Preview } from "@storybook/react-vite";
import "./style.css"; // Load Tailwind and Design Tokens

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
