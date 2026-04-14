const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const SYSTEM_PROMPT = `你是"玉策AI"，一位专业的和田玉销售顾问。你的性格温和专业，像一位经验丰富的玉石行家。

核心能力：
1. 根据客户描述或图片信息，分析和田玉的品质（玉种、白度、细度、油性、皮色等）
2. 给出合理的市场价格参考范围
3. 推荐适合客户需求和预算的产品
4. 用通俗易懂的语言解释专业知识

销售策略：
- 先了解客户需求（自戴/送人/收藏/投资）
- 根据预算推荐合适的产品
- 强调和田玉的文化价值和保值属性
- 适当制造稀缺感（好料难得）
- 引导客户关注品质而非价格

和田玉基础知识：
- 玉种分类：籽料（最贵）、山料、山流水、戈壁料
- 产地：新疆（最正宗）、青海、俄罗斯、韩国
- 颜色：白玉、青白玉、青玉、碧玉、墨玉、黄玉、糖玉
- 评价标准：白度、细度、油性、糯性、皮色、瑕疵
- 常见器型：手镯、牌子、把件、挂件、珠串

价格参考框架：
- 新疆籽料：品质好的克价几百到几万不等
- 俄料：一般为籽料价格的30-50%
- 青海料：价格相对较低
- 手镯类价格最高（费料）
- 有皮色的籽料溢价明显

请用亲切专业的语气回答，适当使用emoji让对话更生动。每次回答控制在200字以内，简洁有力。`;

// 主页
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>玉策AI - 和田玉智能销售助手</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; height: 100vh; display: flex; flex-direction: column; }
        .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c29 50%, #6b8f3c 100%); color: white; padding: 12px 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
        .header h1 { font-size: 20px; margin-bottom: 2px; }
        .header p { font-size: 12px; opacity: 0.9; }
        .chat-container { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; }
        .message { max-width: 80%; padding: 12px 16px; border-radius: 18px; font-size: 15px; line-height: 1.6; word-wrap: break-word; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .bot-msg { background: white; color: #333; align-self: flex-start; border-bottom-left-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .user-msg { background: linear-gradient(135deg, #2d5016, #4a7c29); color: white; align-self: flex-end; border-bottom-right-radius: 6px; }
        .input-area { padding: 12px 15px; background: white; border-top: 1px solid #e0e0e0; display: flex; gap: 10px; align-items: center; }
        .input-area input { flex: 1; padding: 12px 18px; border: 2px solid #e0e0e0; border-radius: 25px; font-size: 15px; outline: none; transition: border-color 0.3s; }
        .input-area input:focus { border-color: #4a7c29; }
        .input-area button { width: 44px; height: 44px; border-radius: 50%; border: none; background: linear-gradient(135deg, #2d5016, #4a7c29); color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
        .typing { display: flex; gap: 4px; padding: 15px 20px; align-self: flex-start; }
        .typing span { width: 8px; height: 8px; background: #999; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        .quick-btns { display: flex; flex-wrap: wrap; gap: 8px; padding: 5px 15px; }
        .quick-btn { padding: 8px 15px; border-radius: 20px; border: 1px solid #4a7c29; color: #4a7c29; background: white; font-size: 13px; cursor: pointer; transition: all 0.3s; }
        .quick-btn:hover { background: #4a7c29; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏔️ 玉策AI</h1>
        <p>和田玉智能销售助手 | 专业鉴赏 · 精准估价</p>
    </div>
    <div class="chat-container" id="chatBox">
        <div class="message bot-msg">您好！我是玉策AI 🏔️ 您的专属和田玉顾问。<br><br>无论您是想选购、鉴赏还是了解行情，我都能帮到您！请问有什么可以为您效劳的？</div>
        <div class="quick-btns">
            <button class="quick-btn" onclick="quickSend('我想买个和田玉手镯')">💍 选手镯</button>
            <button class="quick-btn" onclick="quickSend('帮我看看这块玉怎么样')">🔍 帮鉴赏</button>
            <button class="quick-btn" onclick="quickSend('和田玉怎么辨别真假')">📖 学知识</button>
            <button class="quick-btn" onclick="quickSend('想送长辈一件玉器')">🎁 选礼物</button>
        </div>
    </div>
    <div class="input-area">
        <input type="text" id="msgInput" placeholder="请输入您的问题..." onkeypress="if(event.key==='Enter')sendMsg()">
        <button id="sendBtn" onclick="sendMsg()">➤</button>
    </div>
    <script>
        let chatHistory = [];
        
        function quickSend(text) {
            document.getElementById('msgInput').value = text;
            sendMsg();
            document.querySelector('.quick-btns')?.remove();
        }
        
        async function sendMsg() {
            const input = document.getElementById('msgInput');
            const msg = input.value.trim();
            if (!msg) return;
            
            const btn = document.getElementById('sendBtn');
            btn.disabled = true;
            input.value = '';
            
            appendMsg(msg, 'user-msg');
            chatHistory.push({ role: 'user', content: msg });
            
            const typing = document.createElement('div');
            typing.className = 'typing';
            typing.innerHTML = '<span></span><span></span><span></span>';
            document.getElementById('chatBox').appendChild(typing);
            scrollToBottom();
            
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: chatHistory })
                });
                const data = await res.json();
                typing.remove();
                
                if (data.reply) {
                    appendMsg(data.reply, 'bot-msg');
                    chatHistory.push({ role: 'assistant', content: data.reply });
                } else {
                    appendMsg('抱歉，系统繁忙，请稍后再试 🙏', 'bot-msg');
                }
            } catch (e) {
                typing.remove();
                appendMsg('网络错误，请检查网络后重试 😅', 'bot-msg');
            }
            btn.disabled = false;
            input.focus();
        }
        
        function appendMsg(text, cls) {
            const div = document.createElement('div');
            div.className = 'message ' + cls;
            div.innerHTML = text.replace(/\\n/g, '<br>');
            document.getElementById('chatBox').appendChild(div);
            scrollToBottom();
        }
        
        function scrollToBottom() {
            const box = document.getElementById('chatBox');
            setTimeout(() => box.scrollTop = box.scrollHeight, 100);
        }
    </script>
</body>
</html>`);
});

// API接口
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const apiKey = process.env.DEEPSEEK_API_KEY;
        
        if (!apiKey) {
            return res.json({ reply: '系统配置中，请联系管理员设置API密钥 🔧' });
        }
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages.slice(-10)
                ],
                max_tokens: 500,
                temperature: 0.8
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.json({ reply: data.choices[0].message.content });
        } else {
            res.json({ reply: '抱歉，我没听清，您能再说一次吗？😊' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.json({ reply: '系统繁忙，请稍后再试 🙏' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('玉策AI服务已启动，端口：' + PORT);
});
