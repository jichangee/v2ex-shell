import { getTopicsHot, getTopicDetail } from '../api.js';
import axios from 'axios';
import cheerio from 'cheerio';

// Mock axios
jest.mock('axios');

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopicsHot', () => {
    it('should fetch and parse hot topics correctly', async () => {
      // Mock HTML response
      const mockHtml = `
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

      const result = await getTopicsHot();

      expect(result).toEqual({
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

      await expect(getTopicsHot()).rejects.toThrow('获取热门话题失败: Network error');
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