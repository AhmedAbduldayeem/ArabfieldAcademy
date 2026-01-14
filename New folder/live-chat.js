// live-chat.js - نظام المحادثة المباشرة
class LiveChatSystem {
    constructor() {
        this.isOpen = false;
        this.unreadMessages = 0;
        this.chatHistory = [];
        this.init();
    }

    init() {
        this.createChatWidget();
        this.loadChatHistory();
        this.setupEventListeners();
    }

    createChatWidget() {
        const chatHTML = `
            <div id="live-chat-widget" class="live-chat-widget">
                <!-- Chat Button -->
                <div class="chat-toggle-btn" id="chatToggleBtn">
                    <span class="chat-icon">💬</span>
                    <span class="notification-badge" id="chatBadge">0</span>
                </div>
                
                <!-- Chat Window -->
                <div class="chat-window" id="chatWindow">
                    <div class="chat-header">
                        <h4>Arabfield Academy Support</h4>
                        <span class="status-dot online"></span>
                        <span class="status-text">Online</span>
                        <button class="close-chat" id="closeChat">×</button>
                    </div>
                    
                    <div class="chat-messages" id="chatMessages">
                        <div class="system-message">
                            <p>👋 Welcome! Our team is here to help with any questions about Arabic learning.</p>
                        </div>
                    </div>
                    
                    <div class="quick-questions">
                        <button class="quick-btn" data-question="What's the best program for beginners?">Beginner Programs</button>
                        <button class="quick-btn" data-question="How much does it cost?">Pricing</button>
                        <button class="quick-btn" data-question="Can I try a free lesson?">Free Trial</button>
                    </div>
                    
                    <div class="chat-input-area">
                        <textarea id="chatInput" placeholder="Type your message..." rows="2"></textarea>
                        <button id="sendMessage" class="send-btn">Send</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    setupEventListeners() {
        // فتح/إغلاق الشات
        document.getElementById('chatToggleBtn').addEventListener('click', () => this.toggleChat());
        document.getElementById('closeChat').addEventListener('click', () => this.closeChat());
        
        // إرسال الرسالة
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // الأسئلة السريعة
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.addMessage(question, 'user');
                this.sendToSupport(question);
            });
        });
        
        // إغلاق عند النقر خارج الشات
        document.addEventListener('click', (e) => {
            const chatWidget = document.getElementById('live-chat-widget');
            if (!chatWidget.contains(e.target) && this.isOpen) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('chatWindow');
        
        if (this.isOpen) {
            chatWindow.classList.add('active');
            document.getElementById('chatInput').focus();
            this.unreadMessages = 0;
            this.updateBadge();
        } else {
            chatWindow.classList.remove('active');
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('chatWindow').classList.remove('active');
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${timestamp}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // حفظ في السجل
        this.chatHistory.push({
            text,
            sender,
            timestamp: new Date().toISOString()
        });
        this.saveChatHistory();
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            this.sendToSupport(message);
        }
    }

    sendToSupport(message) {
        // محاكاة رد الدعم (في الإنتاج يتم الاتصال بسيرفر حقيقي)
        setTimeout(() => {
            const responses = {
                "beginner": "Our Modern Standard Arabic (MSA) program is perfect for beginners! It starts from absolute basics.",
                "pricing": "We offer flexible packages starting from $15/hour. Family and group discounts available!",
                "trial": "Yes! You can book a FREE 30-minute trial lesson to experience our teaching style.",
                "default": "Thanks for your message! Our team will respond shortly. In the meantime, check our FAQ section for quick answers."
            };
            
            let response = responses.default;
            if (message.toLowerCase().includes('beginner')) response = responses.beginner;
            if (message.toLowerCase().includes('cost') || message.toLowerCase().includes('price')) response = responses.pricing;
            if (message.toLowerCase().includes('trial') || message.toLowerCase().includes('free')) response = responses.trial;
            
            this.addMessage(response, 'support');
            
            // إشعار إذا كان الشات مغلق
            if (!this.isOpen) {
                this.unreadMessages++;
                this.updateBadge();
            }
        }, 1000 + Math.random() * 2000);
    }

    updateBadge() {
        const badge = document.getElementById('chatBadge');
        badge.textContent = this.unreadMessages;
        badge.style.display = this.unreadMessages > 0 ? 'block' : 'none';
    }

    saveChatHistory() {
        localStorage.setItem('ara_chat_history', JSON.stringify(this.chatHistory));
    }

    loadChatHistory() {
        const saved = localStorage.getItem('ara_chat_history');
        if (saved) {
            this.chatHistory = JSON.parse(saved);
            // عرض آخر 10 رسائل
            const recentMessages = this.chatHistory.slice(-10);
            recentMessages.forEach(msg => {
                if (!document.querySelector(`[data-time="${msg.timestamp}"]`)) {
                    this.addMessage(msg.text, msg.sender);
                }
            });
        }
    }
}

if (typeof window !== 'undefined') {
    window.LiveChatSystem = LiveChatSystem;
}