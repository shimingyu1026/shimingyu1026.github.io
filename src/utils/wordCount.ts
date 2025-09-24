/**
 * 字数统计工具函数
 * 从Markdown/MDX内容中提取纯文本并计算字数
 */

import type { CollectionEntry } from 'astro:content'

/**
 * 从Markdown/MDX内容中提取纯文本
 * @param content - 文章内容
 * @returns 纯文本字符串
 */
function extractTextFromContent(content: string): string {
  // 移除Markdown语法
  let text = content
    // 移除frontmatter
    .replace(/^---[\s\S]*?---\s*/m, '')
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`[^`]*`/g, '')
    // 移除链接文本，保留链接内容
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体和斜体标记
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/__([^_]*)__/g, '$1')
    .replace(/_([^_]*)_/g, '$1')
    // 移除删除线
    .replace(/~~([^~]*)~~/g, '$1')
    // 移除引用标记
    .replace(/^>\s*/gm, '')
    // 移除列表标记
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 移除水平线
    .replace(/^[-*_]{3,}$/gm, '')
    // 移除HTML标签
    .replace(/<[^>]*>/g, '')
    // 移除JSX组件（MDX特有）- 改进正则表达式
    .replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/?>/g, '')
    .replace(/<[A-Z][a-zA-Z0-9]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z0-9]*>/g, '')
    // 移除import语句
    .replace(/^import\s+.*?from\s+['"][^'"]*['"];?\s*$/gm, '')
    // 移除export语句
    .replace(/^export\s+.*?$/gm, '')
    // 移除多余的空格和换行
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

/**
 * 计算文本字数（支持中英文）
 * @param text - 纯文本
 * @returns 字数
 */
function countWords(text: string): number {
  if (!text) return 0
  
  // 移除标点符号和特殊字符，但保留空格
  const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
  
  // 分别统计中文字符和英文单词
  const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || []
  const englishWords = cleanText.match(/[a-zA-Z]+/g) || []
  
  return chineseChars.length + englishWords.length
}

/**
 * 统计单篇文章的字数
 * @param post - 文章条目
 * @returns 字数
 */
export async function getPostWordCount(post: CollectionEntry<'blog'>): Promise<number> {
  try {
    // 获取文章内容
    const body = post.body
    
    if (!body) {
      console.warn(`No body content found for post: ${post.id}`)
      return 0
    }
    
    // 提取纯文本
    const text = extractTextFromContent(body)
    
    // 计算字数
    const wordCount = countWords(text)
    
    return wordCount
  } catch (error) {
    console.warn(`Failed to get word count for post: ${post.id}`, error)
    return 0
  }
}

/**
 * 统计所有文章的总字数
 * @param posts - 文章列表
 * @returns 总字数
 */
export async function getTotalWordCount(posts: CollectionEntry<'blog'>[]): Promise<number> {
  const wordCounts = await Promise.all(
    posts.map(post => getPostWordCount(post))
  )
  
  return wordCounts.reduce((total, count) => total + count, 0)
}
