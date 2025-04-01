#!/usr/bin/env node

import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { getTopicsList, getTopicDetail } from "./api.js";
import { wrapText } from "./utils.js";

async function displayTopicDetail(topic, currentPage) {
  const spinner = ora("正在获取话题详情...").start();

  try {
    const detail = await getTopicDetail(topic.url, currentPage);

    spinner.succeed("获取成功！");
    const repliesLen = detail.replies.length;
    detail.replies.reverse().forEach((reply, index) => {
      console.log(
        chalk.italic(
          `${repliesLen - index + (currentPage - 1) * 100}.` +
          ` ${reply.author}` +
          `${reply.op ? chalk.green(" [OP]") : ""}` +
          `${reply.like ? ` ${chalk.red(`感谢：${reply.like}`)}` : ""}` +
          ` ${chalk.gray(`(${reply.time})`)}`
        )
      );
      console.log(chalk.yellow(wrapText(reply.content)));
      console.log("");
    });

    if (currentPage === 1) {
      console.log(chalk.blue(`\n${topic.title}\n`));
      console.log(chalk.white("内容："));
      console.log(chalk.yellow(wrapText(detail.content)));
      console.log(chalk.blue("\n链接：" + topic.url));
    }

    const choices = [{ name: "返回列表", value: "back" }];

    if (detail.next) {
      choices.unshift({ name: "下一页", value: "next" });
    }
    if (detail.prev) {
      choices.unshift({ name: "上一页", value: "prev" });
    }

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "请选择操作：",
        choices,
      },
    ]);

    return action;
  } catch (error) {
    spinner.fail("获取失败！");
    console.error(chalk.red("错误信息："), error.message);
    return "back";
  }
}

async function main() {
  let topicsUrl = "/?tab=hot";
  while (true) {
    const spinner = ora("正在获取话题...").start();

    try {
      const { topics, tabs, currentTabTitle } = await getTopicsList(topicsUrl);

      spinner.succeed("获取成功！");

      const choices = topics.map((topic) => ({
        name: `${topic.title} (${topic.replies})`,
        value: topic,
      }));

      choices.push({ name: "🚪退出", value: "exit" });
      choices.push({ name: "🔍节点", value: "node" });

      const { selection } = await inquirer.prompt([
        {
          type: "list",
          name: "selection",
          message: `${currentTabTitle}：`,
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
            message: "请选择节点：",
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
      console.error(chalk.red("错误信息："), error.message);
      break;
    }
  }
}

main();
