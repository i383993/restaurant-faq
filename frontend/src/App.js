import { useState, useRef, useEffect } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';

function App() {
  const menuData = [
  {
    category: 'Starters',
    items: [
      { name: 'Caesar Salad', calories: 150, tags: ['Egg', 'Dairy', 'Fish'], description: 'Romaine lettuce, croutons, parmesan, and anchovy dressing.' },
      { name: 'Garlic Bread', calories: 200, tags: ['Veg', 'Dairy', 'Wheat'], description: 'Toasted baguette with garlic butter and herbs.' },
      { name: 'Soup of the Day', calories: 120, tags: ['Vegan', 'GF'], description: 'Freshly made seasonal vegetable soup.' }
    ]
  },
  {
    category: 'Main Course',
    items: [
      { name: 'Grilled Salmon', calories: 550, tags: ['Fish', 'GF'], description: 'Atlantic salmon served with steamed asparagus.' },
      { name: 'Pasta Carbonara', calories: 650, tags: ['Dairy', 'Egg', 'Wheat', 'Pork'], description: 'Spaghetti with creamy sauce, guanciale, and pecorino.' },
      { name: 'Ribeye Steak', calories: 700, tags: ['Beef', 'GF'], description: '10oz grass-fed ribeye with garlic butter.' },
      { name: 'Vegetarian Lasagna', calories: 480, tags: ['Veg', 'Dairy', 'Wheat'], description: 'Layers of pasta, ricotta, and roasted vegetables.' }
    ]
  },
  {
    category: 'Desserts',
    items: [
      { name: 'Chocolate Cake', calories: 320, tags: ['Veg', 'Dairy', 'Egg'], description: 'Rich dark chocolate layer cake.' },
      { name: 'Cheesecake', calories: 380, tags: ['Veg', 'Dairy', 'Wheat'], description: 'New York style. Contains no nuts, but made in a facility that handles nuts.' },
      { name: 'Tiramisu', calories: 350, tags: ['Veg', 'Dairy', 'Caffeine'], description: 'Classic Italian coffee-flavoured dessert.' },
      { name: 'Sorbet', calories: 150, tags: ['Vegan', 'GF', 'Nut-Free'], description: 'Refreshing raspberry or lemon fruit sorbet.' }
    ]
  }
];

  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you with our restaurant today?' }
  ]);

  const [apiHistory, setApiHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to update the streaming message safely
  const updateLastMessage = (text) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], text };
      return updated;
    });
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    
    // 1. Add user message and a placeholder for the bot
    setMessages(prev => [
      ...prev, 
      { sender: 'user', text: userText },
      { sender: 'bot', text: '' } 
    ]);
    
    setLoading(true);

    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: apiHistory })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedResponse += parsed.text;
                updateLastMessage(accumulatedResponse);
              }
            } catch (e) {
              console.error("Error parsing chunk", e);
            }
          }
        }
      }

      setApiHistory(prev => [
        ...prev,
        { role: "user", parts: [{ text: userText }] },
        { role: "model", parts: [{ text: accumulatedResponse }] }
      ]);

    } catch (error) {
      console.error('Error:', error);
      updateLastMessage('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="menu-panel">
        <div className="menu-header"><h2>Menu Insights</h2></div>
        <div className="calorie-recommendation">
          <p className="calorie-info">Recommended per meal: <span className="kcal-bold">500–700 kcal</span></p>
        </div>
        <div className="menu-content">
          {menuData.map((section, idx) => (
            <div key={idx} className="menu-section">
              <h3 className="menu-category">{section.category}</h3>
              <ul className="menu-items">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="menu-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-calories">~{item.calories} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-panel">
        <div className="chat-header">
          <h1>🍽️ Restaurant FAQ Bot</h1>
          <p className="subtitle">Powered by Gemini</p>
        </div>

        <div className="messages-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">
                {/* Use ReactMarkdown only for bot messages to render formatting */}
                {msg.sender === 'bot' ? (
                  <ReactMarkdown>{msg.text || (loading && index === messages.length - 1 ? '...' : '')}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="input-box" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our menu..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;