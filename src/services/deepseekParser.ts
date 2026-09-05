export interface ParsedQA {
  question: string
  answer: string
  speaker?: string
  sourceQuote?: string
}

const SYSTEM_PROMPT = `你是一个面试记录整理助手。用户会给你一段面试录音转写文本（可能已经标注了说话人，也可能没有）。
请你识别出面试官提出的问题，以及候选人（"我"）给出的对应回答，整理成结构化的问答列表。

要求：
1. 同一个问题下候选人连续的回答（包括面试官简短追问/附和打断）应合并为一个 answer。
2. 忽略与面试内容无关的寒暄、跑题闲聊。
3. 每条记录提供一个 sourceQuote 字段：从原文中摘录一小段（15-30字以内）、能在原文中唯一定位到这条问答起始位置的原文片段，不要改写原文用词。
4. 如果能判断出说话人角色，speaker 填 "面试官" 或 "我"；无法判断则留空字符串。
5. 严格按以下 JSON 格式输出，不要输出任何多余文字、不要用 markdown 代码块包裹：
{"qaList": [{"question": "string", "answer": "string", "speaker": "string", "sourceQuote": "string"}]}`

export class DeepSeekParseError extends Error {}

export async function parseTranscript(
  rawText: string,
  apiKey: string,
  model: string,
): Promise<ParsedQA[]> {
  if (!apiKey) {
    throw new DeepSeekParseError('请先在设置页填写 DeepSeek API Key')
  }

  const res = await fetch('/deepseek-api/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: rawText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new DeepSeekParseError(
      `DeepSeek 接口调用失败 (${res.status})：${text.slice(0, 300)}`,
    )
  }

  const data = await res.json()
  const content: string | undefined = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new DeepSeekParseError('DeepSeek 返回内容为空')
  }

  let parsed: { qaList?: ParsedQA[] }
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new DeepSeekParseError('解析结果不是合法 JSON，请重试')
  }

  if (!Array.isArray(parsed.qaList)) {
    throw new DeepSeekParseError('解析结果格式不符合预期')
  }

  return parsed.qaList
}
