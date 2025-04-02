import axios from "axios";
import * as cheerio from "cheerio";
import { convertHTMLContentToText } from "./utils.js";

const BASE_URL = "https://www.v2ex.com";

export async function getTopicsList(url) {
  try {
    const response = await axios.get(`${BASE_URL}${url}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const topics = [];
    const tabs = [];
    // 解析热门话题列表
    $(".cell.item").each((i, element) => {
      const $element = $(element);
      const topic = {
        title: $element.find(".topic-link").text().trim(),
        url: (BASE_URL + $element.find(".topic-link").attr("href")).split(
          "#"
        )[0],
        node: $element.find(".node").text().trim(),
        author: $element.find(".topic_info strong a").first().text().trim(),
        lastReplyTime: $element.find(".topic_info span[title]").text().trim(),
        lastReplyAuthor: $element
          .find(".topic_info strong a")
          .last()
          .text()
          .trim(),
        replies: $element.find(".count_livid").text().trim() || "0",
        avatar: $element.find(".avatar").attr("src"),
      };
      topics.push(topic);
    });

    $("#Tabs a").each((i, element) => {
      const $element = $(element);
      const tab = {
        title: $element.text().trim(),
        url: $element.attr("href"),
      };
      tabs.push(tab);
    });

    const currentTabTitle = $(".tab_current").text().trim();

    return {
      topics,
      tabs,
      currentTabTitle,
    };
  } catch (error) {
    throw new Error(`获取热门话题失败: ${error.message}，${BASE_URL}${url}`);
  }
}

export async function getTopicDetail(url, page = 1) {
  try {
    const response = await axios.get(`${url}?p=${page}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const content = convertHTMLContentToText($(".topic_content").html());

    const replies = [];

    $('.cell[id^="r_"]').each((i, element) => {
      const $element = $(element);
      const reply = {
        author: $element.find(".dark").text().trim(),
        content: convertHTMLContentToText($element.find(".reply_content").html()),
        like: $element.find("td .small.fade").text().trim(),
        time: $element.find(".ago").text().trim(),
        op: $element.find(".badge.op").text().trim() === "OP",
      };
      replies.push(reply);
    });
    const hasPagin = $(".ps_container").length > 0;
    const prev = hasPagin
      ? !$(".ps_container > table table td:first-child").hasClass("disable_now")
      : false;
    const next = hasPagin
      ? !$(".ps_container > table table td:last-child").hasClass("disable_now")
      : false;

    return {
      content,
      replies,
      prev,
      next,
    };
  } catch (error) {
    throw new Error(`获取话题详情失败: ${error.message}`);
  }
}
