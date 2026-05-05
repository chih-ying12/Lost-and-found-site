* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8dff5 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
}

.app-container {
  width: 100%;
  max-width: 440px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 36px;
  box-shadow: 0 30px 50px rgba(0,0,0,0.08), 0 10px 20px rgba(0,0,0,0.03);
  padding: 28px 22px;
  border: 1px solid rgba(255,255,255,0.6);
  transition: all 0.2s ease;
}

.hidden {
  display: none !important;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.7rem;
  font-weight: 700;
  color: #2d2a4a;
  letter-spacing: -0.3px;
}

input,
select,
textarea,
button {
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid #e0e4f0;
  border-radius: 18px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #ffffff;
  outline: none;
  color: #1e1936;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #8176b5;
  box-shadow: 0 0 0 3px rgba(129,118,181,0.15);
  background: #fff;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

button {
  background: linear-gradient(135deg, #6c5ce7, #4834d4);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  box-shadow: 0 4px 14px rgba(108,92,231,0.25);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108,92,231,0.35);
}

button:active {
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(108,92,231,0.25);
}

/* Secondary button style */
button.secondary {
  background: rgba(255,255,255,0.7);
  color: #4834d4;
  border: 1.5px solid #ddd6f3;
  box-shadow: none;
}

button.secondary:hover {
  background: #f7f3ff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.emoji-icon {
  font-size: 1.6rem;
  line-height: 1;
}

/* Card redesign */
.card {
  background: white;
  border-radius: 22px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.04);
  border: 1px solid #f0edfa;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.07);
}

.card .row {
  justify-content: space-between;
  align-items: center;
}

.card strong {
  color: #2d2a4a;
}

.card .item-photo {
  max-width: 80px;
  border-radius: 16px;
  border: 2px solid #f0edfa;
  margin-top: 6px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

/* Verification popup */
.verify-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.popup-content {
  background: white;
  padding: 26px 22px;
  border-radius: 28px;
  width: 90%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 0.95rem;
  box-shadow: 0 30px 50px rgba(0,0,0,0.15);
  animation: slideUp 0.25s ease;
}

.popup-content h3 {
  font-size: 1.4rem;
  margin-bottom: 4px;
  color: #2d2a4a;
}

.small-btn {
  padding: 8px 16px;
  font-size: 0.85rem;
  background: #f0edfa;
  color: #4834d4;
  border: 1px solid #ddd6f3;
  box-shadow: none;
  border-radius: 14px;
}

.small-btn:hover {
  background: #e2daf8;
}

.contact-info {
  background: #f7f4ff;
  border-radius: 14px;
  padding: 10px;
  margin-top: 6px;
  font-size: 0.85rem;
  word-break: break-word;
  color: #2d2a4a;
  border: 1px solid #e9e3fc;
}

/* Status / message colors */
#authMessage,
#foundMessage,
#verifyMessage,
#verifyStatusMessage {
  font-weight: 500;
  text-align: center;
}

/* Subtle animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* For the login page card feel */
#loginPage, #homePage, #lostPage, #foundPage {
  animation: fadeIn 0.25s ease;
}
