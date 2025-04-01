export function wrapText(text, len = 50) {
  let result = "";
  let index = 0;
  text.split("").forEach((char) => {
    if (char === "\n") {
      index = 0;
    }
    if (index % len === 0 && index !== 0) {
      result += "\n";
    }
    result += char;
    index++;
  });
  return result;
}

export function getUserListInTopic(topic) {
  const userList = topic.match(/@[^\s]+/g);
  if (!userList) return [];
  return userList.map((user) => user.slice(1));
}

export function refReplyContent(replies, lastReplys) {
  return replies.map((reply, index) => {
    let replyContent = '';
    const userList = getUserListInTopic(reply.content);
  
    if (userList.length > 0) {
      userList.forEach(username => {
        const prevReply = lastReplys.slice(0, lastReplys.length - replies.length + index).reverse().find(r => r.author === username);
        if (prevReply) {
          replyContent += `\n引用 @${username} 的发言:\n${prevReply.content}\n`;
        }
      });
    }
  
    return {
      ...reply,
      replyContent
    }
  });
}