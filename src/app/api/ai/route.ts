import { NextRequest, NextResponse } from "next/server";

// Socratic tutoring system prompt
const SOCRATIC_SYSTEM_PROMPT = `你是一只名叫"知知"的智慧猫头鹰，是一个温柔、耐心、充满智慧的AI辅导老师。
你正在帮助一个6-8岁的小学二年级孩子学习。

核心规则：
1. 绝对不能直接告诉孩子正确答案
2. 用引导式提问帮助孩子自己发现答案
3. 语言要简单、亲切、充满鼓励
4. 每次只问一个问题，不要一次问太多
5. 适当使用emoji增加趣味性
6. 如果孩子完全答不出来，可以给出非常明显的暗示

根据孩子的错误类型，采用不同策略：
- 计算错误 → "我们一起来数数好不好？先伸出手指..."
- 概念错误 → 用简单的对比引导："你觉得哪个更大呢？"
- 粗心错误 → "你再仔细看看这个数字..."

回答格式要求：简洁，不超过3句话。用友好可爱的语气。`;

// Content generation system prompt
const CONTENT_SYSTEM_PROMPT = `你是一个面向小学1-3年级儿童的教育内容生成器。
你负责为"奇知岛 Wonder Island"学习平台生成有趣的科普内容。

规则：
1. 语言简单，适合6-9岁儿童理解
2. 内容准确，有科学依据
3. 风格有趣，可以用拟人化、比喻等手法
4. 适当使用emoji增加趣味性
5. 每次回答不超过150字

你生成的内容包括：趣味知识小故事、知识延展卡片、个性化鼓励语等。`;

// Personalized encouragement generator
const ENCOURAGE_SYSTEM_PROMPT = `你是一只名叫"知知"的智慧猫头鹰AI老师。
根据孩子的学习表现生成个性化鼓励语。

规则：
1. 语气温暖、充满鼓励
2. 具体指出孩子做得好的地方
3. 如果有错误，用积极的语言表达
4. 适当使用emoji
5. 不超过2句话

示例：
- 答对时："你太厉害了！连续答对3道题，连知知都要向你学习呢！🌟"
- 答错时："没关系，知知相信你下次一定能答对！你已经在进步了哦～💪"
- 完成关卡时："恭喜你完成了星空探险！你收集了好多水晶碎片，奇知星的光芒恢复了！🎉"`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, context } = body;

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "socratic":
        systemPrompt = SOCRATIC_SYSTEM_PROMPT;
        userPrompt = `孩子正在做以下题目：
题目：${context.question}
正确答案：${context.correctAnswer}
孩子的回答：${context.childAnswer}
孩子的错误类型：${context.errorType || "未知"}

请用苏格拉底式辅导方法，生成一句引导性的话，帮助孩子自己发现正确答案。`;
        break;

      case "content":
        systemPrompt = CONTENT_SYSTEM_PROMPT;
        userPrompt = `请为以下知识点生成一段有趣的科普内容：
知识点：${context.topic}
年级：二年级
当前主题：${context.theme || "太空探险"}
要求：${context.requirement || "趣味小故事"}`;
        break;

      case "encourage":
        systemPrompt = ENCOURAGE_SYSTEM_PROMPT;
        userPrompt = `孩子的学习情况：
- 连续答对题数：${context.streak || 0}
- 总答对题数：${context.correct || 0}
- 总答题数：${context.total || 0}
- 当前完成的任务：${context.task || "数学闯关"}
- 是否刚完成关卡：${context.levelComplete ? "是" : "否"}

请生成一句个性化鼓励语。`;
        break;

      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    // Call LLM API (using a mock for demo, replace with actual API)
    const aiResponse = await callLLM(systemPrompt, userPrompt);

    return NextResponse.json({
      success: true,
      type,
      response: aiResponse,
    });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  // Check for API key - use environment variable
  const apiKey = process.env.LLM_API_KEY;

  if (apiKey) {
    // Call actual LLM API (supports OpenAI-compatible APIs like Qwen/DeepSeek)
    const apiBase = process.env.LLM_API_BASE || "https://api.openai.com/v1";
    const model = process.env.LLM_MODEL || "gpt-4o-mini";

    try {
      const response = await fetch(`${apiBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.error("LLM API call failed:", e);
    }
  }

  // Fallback: Intelligent mock responses (for demo without API key)
  return generateMockResponse(systemPrompt, userPrompt);
}

function generateMockResponse(systemPrompt: string, userPrompt: string): string {
  if (systemPrompt === SOCRATIC_SYSTEM_PROMPT) {
    // Parse context from user prompt for smarter mock
    if (userPrompt.includes("加法") || userPrompt.includes("+")) {
      const match = userPrompt.match(/题目：(.+?)(?:\n|$)/);
      const answer = userPrompt.match(/正确答案：(\d+)/)?.[1] || "?";
      const childAnswer = userPrompt.match(/孩子的回答：(\d+)/)?.[1] || "?";

      if (childAnswer !== "?") {
        const diff = parseInt(answer) - parseInt(childAnswer);
        if (diff > 0) {
          return `嗯...${childAnswer}，很接近了！我们再来数一数好不好？从${parseInt(childAnswer)}开始，再加${diff}，数数看是多少呢？🤔`;
        } else if (diff < 0) {
          return `差一点点哦！我们一起来重新数一遍，这次一个一个仔细数，不着急～👆`;
        }
      }
      return `我们一起来算一算好不好？伸出你的小手指，先数前面的数，再数后面的数，然后合在一起看看是几呢？✨`;
    }

    if (userPrompt.includes("方向") || userPrompt.includes("太阳")) {
      return `小探险家，想一想太阳从哪边升起呀？对啦，是东边！那早晨面对太阳时，你的前面是什么方向呢？🌟`;
    }

    return `没关系，我们换个方式想一想！你知道...这就像搭积木一样，一块一块慢慢来～🧱`;
  }

  if (systemPrompt === CONTENT_SYSTEM_PROMPT) {
    if (userPrompt.includes("太阳")) {
      return `☀️ 你知道吗？太阳其实是一颗超级大的恒星！它大到可以放下100万个地球呢！太阳的表面温度有5500度，非常非常热。虽然太阳看起来很小，但那是因为它离我们太远啦——足足有1.5亿公里！`;
    }
    if (userPrompt.includes("月亮")) {
      return `🌙 月亮是地球的邻居，它一直在绕着地球转圈圈。月球上没有空气，也没有水，所以宇航员去月球要穿厚厚的宇航服！月亮上的脚印可以保存好几百年，因为那里没有风吹雨打～`;
    }
    return `🌟 在夜空中，那些一闪一闪的星星，每颗都是一颗太阳！它们离我们太远太远了，所以看起来只有针尖那么小。有些星星比我们的太阳还要大好几倍呢！`;
  }

  if (systemPrompt === ENCOURAGE_SYSTEM_PROMPT) {
    const streakMatch = userPrompt.match(/连续答对题数：(\d+)/);
    const streak = streakMatch ? parseInt(streakMatch[1]) : 0;

    if (streak >= 5) return `哇，你连续答对了${streak}道题！简直太厉害了！知知都想拜你为师了！🌟🤩`;
    if (streak >= 3) return `连续${streak}题全对！你今天的星星之力超强！继续保持哦～⭐`;
    if (userPrompt.includes("是")) return `太棒了！恭喜你完成了探险任务！奇知星的Crystal都在发光，全是因为你呢！🎉💎`;
    return `你做得真不错！每一步都在进步，知知为你感到骄傲！继续加油哦～💪✨`;
  }

  return "知知正在思考中...";
}
