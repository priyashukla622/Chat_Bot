import React, { useState } from "react";
import "./chatbot.css";

const apiKey = import.meta.env.VITE_API_URL;
const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    try {
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: input }] }] }),
      });

      const data = await response.json();
      let aiText =
        data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text)
          .join(" ") || "No response";

      setMessages((prev) => [...prev, { role: "ai", text: "" }]);
      const aiIndex = messages.length + 1;
      const words = aiText.split(" ");
      const info = words.filter(
        (word, i, arr) => i === 0 || word !== arr[i - 1]
      );
      let i = 0;
      let addText = "";
      const interval = setInterval(() => {
        addText += (i > 0 ? " " : "") + info[i];
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[aiIndex] = { ...newMessages[aiIndex], text: addText };
          return newMessages;
        });
        i++;
        if (i>=info.length){
          clearInterval(interval);
        } 
      }, 200);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error in response" },
      ]);
    }
    setInput("");
  };
  return (
    <div className="container">
      <header>
        <h1>Gemini AI ChatBot</h1>
      </header>
      <div className="chatBot">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.role === "user" ? "userMessage" : "aiMessage"}
          >
            <b>{msg.role === "user" ? "You" : "AI"}:</b> {msg.text}
          </div>
        ))}
      </div>
      <div className="input-Container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
export default ChatBot;