import * as log from "log";

log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG", {
        formatter: "[{levelName}] {msg}",
      }),
  },

  loggers: {
    braino: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

export const logger = log.getLogger("braino");

