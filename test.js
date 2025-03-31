import { getTopicsHot } from "./api.js";

function test() {
  getTopicsHot().then(console.log);
}

test();
