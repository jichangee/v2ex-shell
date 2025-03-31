#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getTopicsHot, getTopicDetail } from './api.js';
import { wrapText } from './utils.js';

async function displayTopicDetail(topic) {
  const spinner = ora('正在获取话题详情...').start();
  
  try {
    const detail = await getTopicDetail(topic.url);
    
    spinner.succeed('获取成功！');
    const repliesLen = detail.replies.length;
    detail.replies.reverse().forEach((reply, index) => {
      console.log(chalk.gray(`${repliesLen - index}. ${reply.author} ${reply.op ? chalk.green('[OP]') : ''} (${reply.time}) ${reply.like ? ` 感谢：${reply.like}` : ''}`));
      console.log(chalk.yellow(wrapText(reply.content)));
      console.log('');
    });

    console.log(chalk.blue(`\n${topic.title}\n`));
    console.log(chalk.white('内容：'));
    console.log(chalk.yellow(wrapText(detail.content)));
    console.log(chalk.blue('\n回复：\n'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '请选择操作：',
        choices: [
          { name: '返回列表', value: 'back' },
          { name: '退出', value: 'exit' }
        ]
      }
    ]);
    
    return action;
  } catch (error) {
    spinner.fail('获取失败！');
    console.error(chalk.red('错误信息：'), error.message);
    return 'back';
  }
}

async function main() {
  let currentPage = 1;
  
  while (true) {
    const spinner = ora('正在获取热门话题...').start();
    
    try {
      const { topics } = await getTopicsHot(currentPage);
      
      spinner.succeed('获取成功！');
      
      const choices = topics.map(topic => ({
        name: topic.title,
        value: topic
      }));
      
      choices.push({ name: '退出', value: 'exit' });
      
      const { selection } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selection',
          message: '请选择操作：',
          choices
        }
      ]);
      
      if (selection === 'exit') {
        break;
      } else {
        const action = await displayTopicDetail(selection);
        if (action === 'exit') {
          break;
        }
      }
    } catch (error) {
      spinner.fail('获取失败！');
      console.error(chalk.red('错误信息：'), error.message);
      break;
    }
  }
}

main();