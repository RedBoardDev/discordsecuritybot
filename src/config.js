import configFile from '../config.json' assert { type: 'json' };

export const getConfigValue = (key) => {
  const keys = key.split('.');
  let value = configFile;
  for (let i = 0; i < keys.length; i++) {
    value = value[keys[i]];
    if (value === undefined) {
      return null;
    }
  }
  return value;
};
