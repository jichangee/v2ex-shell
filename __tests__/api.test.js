import { getTopicsList, getTopicDetail } from '../api.js';
import axios from 'axios';
import cheerio from 'cheerio';

// Mock axios
jest.mock('axios');

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopicsList', () => {
    it('应该正确获取和解析热主题', async () => {
      // Mock HTML response
      const mockHtml = `
        <div class="cell" id="Tabs">
        <a href="/?tab=tech" class="tab">技术</a><a href="/?tab=creative" class="tab">创意</a><a href="/?tab=play" class="tab">好玩</a><a href="/?tab=apple" class="tab">Apple</a><a href="/?tab=jobs" class="tab">酷工作</a><a href="/?tab=deals" class="tab">交易</a><a href="/?tab=city" class="tab">城市</a><a href="/?tab=qna" class="tab">问与答</a><a href="/?tab=hot" class="tab_current">最热</a><a href="/?tab=all" class="tab">全部</a><a href="/?tab=r2" class="tab">R2</a><a href="/xna" class="tab">VXNA</a>
        </div>
        <div class="cell item">
          <table>
            <tr>
              <td>
                <a href="/member/testuser">
                  <img src="https://example.com/avatar.png" class="avatar">
                </a>
              </td>
              <td>
                <span class="item_title">
                  <a href="/t/123" class="topic-link">Test Topic</a>
                </span>
                <div class="sep5"></div>
                <span class="topic_info">
                  <a class="node">test</a> • 
                  <strong><a href="/member/testuser">testuser</a></strong> • 
                  <span title="2024-03-31 10:00:00">1 小时前</span> • 
                  最后回复来自 <strong><a href="/member/replyuser">replyuser</a></strong>
                </span>
              </td>
              <td>
                <a href="/t/123#reply5" class="count_livid">5</a>
              </td>
            </tr>
          </table>
        </div>
      `;

      axios.get.mockResolvedValueOnce({
        data: mockHtml,
        status: 200
      });

      const result = await getTopicsList('/?tab=hot');

      expect(result).toEqual({
        currentTabTitle: '最热',
        tabs: [{
          title: '技术',
          url: '/?tab=tech'
        }, {
          title: '创意',
          url: '/?tab=creative'
        }, {
          title: '好玩',
          url: '/?tab=play'
        }, {
          title: 'Apple',
          url: '/?tab=apple'
        }, {
          title: '酷工作',
          url: '/?tab=jobs'
        }, {
          title: '交易',
          url: '/?tab=deals'
        }, {
          title: '城市',
          url: '/?tab=city'
        }, {
          title: '问与答',
          url: '/?tab=qna'
        }, {
          title: '最热',
          url: '/?tab=hot'
        }, {
          title: '全部',
          url: '/?tab=all'
        }, {
          title: 'R2',
          url: '/?tab=r2'
        }, {
          title: 'VXNA',
          url: '/xna'
        }],
        topics: [{
          title: 'Test Topic',
          url: 'https://www.v2ex.com/t/123',
          node: 'test',
          author: 'testuser',
          lastReplyTime: '1 小时前',
          lastReplyAuthor: 'replyuser',
          replies: '5',
          avatar: 'https://example.com/avatar.png'
        }]
      });

      expect(axios.get).toHaveBeenCalledWith(
        'https://www.v2ex.com/?tab=hot',
        expect.any(Object)
      );
    });

    it('should handle network errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getTopicsList()).rejects.toThrow('获取热门话题失败: Network error');
    });
  });

  describe('getTopicDetail', () => {
    it('应该正确获取和解析主题详细信息', async () => {
      const mockHtml = `
        <div class="topic_content">Test content</div>
        <div class="cell" id="r_1">
          <div class="dark">user1</div>
          <div class="reply_content">Reply 1</div>
          <div class="ago">1 小时前</div>
        </div>
      `;

      axios.get.mockResolvedValueOnce({
        data: mockHtml,
        status: 200
      });

      const result = await getTopicDetail('https://www.v2ex.com/t/123');

      expect(result).toEqual({
        content: 'Test content',
        next: false,
        prev: false,
        replies: [{
          author: 'user1',
          content: 'Reply 1',
          time: '1 小时前',
          "like": "",
          "op": false,
        }]
      });

      expect(axios.get).toHaveBeenCalledWith(
        'https://www.v2ex.com/t/123?p=1',
        expect.any(Object)
      );
    });

    it('should handle network errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getTopicDetail('https://www.v2ex.com/t/123'))
        .rejects.toThrow('获取话题详情失败: Network error');
    });
  });
}); 