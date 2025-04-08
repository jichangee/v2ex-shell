#!/usr/bin/env node

import ora from "ora";
import inquirer from "inquirer";
import { getTopicsList, getTopicDetail } from "./api.js";
import { wrapText, refReplyContent } from "./utils.js";
import { getTheme, themeChoices } from "./theme.js";

let theme = getTheme();
let lastReplys = [];
async function displayTopicDetail(topic, currentPage) {
  const spinner = ora(theme.default("正在获取话题详情...")).start();

  try {
    const detail = await getTopicDetail(topic.url, currentPage);
    if (currentPage === 1) {
      lastReplys = [...detail.replies];
    } else {
      lastReplys = [...lastReplys, ...detail.replies];
    }
    spinner.succeed(theme.default("获取成功！"));
    detail.replies = refReplyContent(detail.replies, lastReplys);
    const repliesLen = detail.replies.length;
    detail.replies.reverse().forEach((reply, index) => {
      console.log(
        theme.default(
          `${repliesLen - index + (currentPage - 1) * 100}.` +
          `${reply.author} ` +
          `${reply.op ? "[OP] " : ""}` +
          `${reply.like ? ` ${theme.like(`感谢：${reply.like} `)}` : ""}` +
          `(${reply.time})`
        )
      );
      console.log(theme.content(wrapText(reply.content)));
      if (reply.replyContent) {
        console.log(theme.reply(wrapText(reply.replyContent)));
      }
      console.log("");
    });

    if (currentPage === 1) {
      console.log(theme.default(`\n标题：${topic.title}\n`));
      if (detail.content) {
        console.log(theme.content(wrapText(detail.content)));
      }
      console.log(theme.default("\n链接：" + topic.url));
    }

    const choices = [{ name: theme.default("返回列表"), value: "back" }];

    if (detail.next) {
      choices.unshift({ name: theme.default("下一页"), value: "next" });
    }
    if (detail.prev) {
      choices.unshift({ name: theme.default("上一页"), value: "prev" });
    }

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: theme.default("请选择操作："),
        choices,
      },
    ]);

    return action;
  } catch (error) {
    spinner.fail("获取失败！");
    console.error(theme.error("错误信息："), error.message);
    return "back";
  }
}

async function main() {
  let topicsUrl = "/?tab=hot";
  while (true) {
    const spinner = ora(theme.default("正在获取话题...")).start();

    try {
      const { topics, tabs, currentTabTitle } = await getTopicsList(topicsUrl);

      spinner.succeed(theme.default("获取成功！"));

      const choices = topics.map((topic) => ({
        name: theme.default(`${topic.title} (${topic.replies})`),
        value: topic,
      }));

      choices.push({ name: theme.default("🚪退出"), value: "exit" });
      choices.push({ name: theme.default("🔧主题"), value: "theme" });
      choices.push({ name: theme.default("🔍节点"), value: "node" });

      const { selection } = await inquirer.prompt([
        {
          type: "list",
          name: "selection",
          message: theme.default(`${currentTabTitle}：`),
          choices,
        },
      ]);

      if (selection === "exit") {
        break;
      } else if (selection === "node") {
        const { selection: nodeSelection } = await inquirer.prompt([
          {
            type: "list",
            name: "selection",
            message: theme.default("请选择节点："),
            choices: tabs.map((tab) => ({
              name: tab.title,
              value: tab,
            })),
          },
        ]);

        if (nodeSelection === "back") {
          continue;
        } else {
          topicsUrl = nodeSelection.url;
        }
      } else if (selection === "theme") {
        const { selection: themeSelection } = await inquirer.prompt([
          {
            type: "list",
            name: "selection",
            message: theme.default("请选择主题："),
            choices: themeChoices,
          },
        ]);
        theme = getTheme(themeSelection);
      } else {
        let currentPage = 1;
        while (true) {
          const action = await displayTopicDetail(selection, currentPage);
          if (action === "back") {
            break;
          } else if (action === "prev") {
            currentPage--;
          } else if (action === "next") {
            currentPage++;
          }
        }
      }
    } catch (error) {
      spinner.fail("获取失败！");
      console.error(theme.error("错误信息："), error.message);
      break;
    }
  }
}

main();
