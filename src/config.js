// src/config.js
const HOST = process.env.REACT_APP_BASE_URL || "127.0.0.1:8001";
const IS_LOCAL = HOST.includes("127.0.0.1") || HOST.includes("localhost");

export const HTTP_BASE = `${IS_LOCAL ? "http" : "https"}://${HOST}`;
export const WS_BASE   = `${IS_LOCAL ? "ws" : "wss"}://${HOST}`;
