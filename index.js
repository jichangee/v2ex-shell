#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getTopicsHot, getTopicDetail } from './api.js';

async function displayTopics(topics, currentPage) {
  console.log(chalk.blue(`\nV2EX 热门话题 (第 ${currentPage} 页)：\n`));
  
  topics.forEach((topic, index) => {
    console.log(chalk.yellow(`${index + 1}. ${topic.title}`));
    console.log(chalk.gray(`   标签: ${topic.node}`));
    console.log(chalk.gray(`   发帖人: ${topic.author}`));
    console.log(chalk.gray(`   最后回帖: ${topic.lastReplyAuthor} (${topic.lastReplyTime})`));
    console.log(chalk.gray(`   回复数: ${topic.replies}`));
    console.log(chalk.gray(`   链接: ${topic.url}\n`));
  });
}

async function displayTopicDetail(topic) {
  const spinner = ora('正在获取话题详情...').start();
  
  try {
    const detail = await getTopicDetail(topic.url);
    
    spinner.succeed('获取成功！');
    
    console.log(chalk.blue(`\n${topic.title}\n`));
    console.log(chalk.white('内容：'));
    console.log(chalk.yellow(detail.content));
    console.log(chalk.blue('\n回复：\n'));
    
    detail.replies.forEach((reply, index) => {
      console.log(chalk.gray(`${index + 1}. ${reply.author} (${reply.time}) ${reply.like ? ` 感谢：${reply.like}` : ''}`));
      console.log(chalk.yellow(reply.content));
      console.log('');
    });
    
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
      
      await displayTopics(topics, currentPage);
      
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
      } else if (selection === 'prev') {
        currentPage--;
      } else if (selection === 'next') {
        currentPage++;
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