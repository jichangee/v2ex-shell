import { getTopicDetail } from "./api.js";

function test() {
  getTopicDetail('https://www.v2ex.com/t/1122214').then(console.log)
}

test()