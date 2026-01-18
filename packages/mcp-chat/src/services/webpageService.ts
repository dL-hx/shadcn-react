import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { extractTextFromHtml, summarizeWithAI } from '../utils/helpers.js';

export interface WebpageResult {
  success: boolean;
  url: string;
  originalLength?: number;
  extractedLength?: number;
  summary?: string;
  rawText?: string;
  error?: string;
}

export class WebpageService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async fetchWebpage(url: string): Promise<WebpageResult> {
    try {
      console.log('开始爬取网页:', url);
      
      await this.initializeBrowser();
      await this.initializePage();
      
      await this.navigateToUrl(url);
      const html = await this.getPageContent();
      console.log('网页内容长度:', html.length);
      
      await this.cleanup();
      
      if (html.length === 0) {
        console.error('网页内容为空');
        return {
          success: false,
          error: '网页内容为空',
          url
        };
      }
      
      const textContent = extractTextFromHtml(html);
      console.log('提取的文本长度:', textContent.length);
      
      if (textContent.length < 100) {
        console.warn('提取的文本过短，可能不是有效网页');
        return {
          success: false,
          error: '提取的文本过短，可能不是有效网页',
          url,
          rawText: textContent
        };
      }
      
      const summary = await summarizeWithAI(textContent);
      
      return {
        success: true,
        url,
        originalLength: html.length,
        extractedLength: textContent.length,
        summary: summary,
        rawText: textContent.substring(0, 5000)
      };
    } catch (error) {
      console.error('网页爬取错误:', error);
      
      await this.cleanup();
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      if (errorMessage.includes('Executable doesn\'t exist') || errorMessage.includes('playwright install')) {
        return {
          success: false,
          error: 'Playwright 浏览器未安装。请运行: npx playwright install',
          url
        };
      }
      
      return {
        success: false,
        error: errorMessage,
        url
      };
    }
  }

  private async initializeBrowser(): Promise<void> {
    if (this.browser) {
      return;
    }
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  }

  private async initializePage(): Promise<void> {
    if (!this.context) {
      throw new Error('浏览器上下文未初始化');
    }
    
    this.page = await this.context.newPage();
    
    await this.page.setViewportSize({
      width: 1920,
      height: 1080
    });
  }

  private async navigateToUrl(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('页面未初始化');
    }
    
    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  }

  private async getPageContent(): Promise<string> {
    if (!this.page) {
      throw new Error('页面未初始化');
    }
    
    return await this.page.content();
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error('清理资源失败:', error);
    }
  }

  async close(): Promise<void> {
    await this.cleanup();
  }
}

export const webpageService = new WebpageService();
