import chalk from "chalk";
import NodeCache from "node-cache";

const cache = new NodeCache();

const themes = {
  classic: {
    content: 'yellow',
    default: 'white',
    reply: 'blue',
    like: 'red',
    error: 'red',
  },
  simple: {
    content: 'white',
    default: 'white',
    reply: 'white',
    like: 'white',
    error: 'white',
  },
  dark: {
    content: 'gray',
    default: 'gray',
    reply: 'gray',
    like: 'gray',
    error: 'gray',
  },
};

export const themeChoices = [
  { name: chalk.white("经典"), value: "classic" },
  { name: chalk.white("简约"), value: "simple" },
  { name: chalk.white("暗黑"), value: "dark" },
];

export const getTheme = (themeName) => {
  if (themeName) {
    cache.set("theme", themeName);
  }
  const colors = themes[cache.get("theme")] || themes.classic;
  return {
    content: chalk[colors.content],
    default: chalk[colors.default],
    reply: chalk[colors.reply],
    like: chalk[colors.like],
    error: chalk[colors.error],
  };
};
