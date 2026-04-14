// Global variables
let currentUser = null;
let currentClaimId = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// ========== AUTHENTICATION ==========
async function checkAuth() {
    try {
        const response = await fetch('/api/me');
        currentUser = await response.json();
        
        if (currentUser) {
            document.getElementById('authContainer').innerHTML = '';
            document.getElementById('appContainer').classList.remove('hidden');
            renderApp();
        } else {
            document.getElementById('appContainer').classList.add('hidden');
            renderAuth();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        renderAuth();
    }
}

function renderAuth() {
    const container = document.getElementById('authContainer');
    container.innerHTML = `
        <div class="form-container" style="max-width: 450px; margin: 0 auto;">
            <h2 style="margin-bottom: 20px; text-align: center;">Welcome to Secure Lost and Found</h2>
            <div class="tabs" style="justify-content: center;">
                <button class="tab active" onclick="switchAuthTab('login')">Login</button>
                <button class="tab" onclick="switchAuthTab('register')">Register</button>
            </div>
            <div id="loginForm" class="tab-content active">
                <form onsubmit="login(event)">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="loginUsername" required placeholder="demo or operator">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" required placeholder="user123 or operator123">
                    </div>
                    <button type="submit" style="width: 100%;">Login</button>
                </form>
                <p style="margin-top: 15px; text-align: center; font-size: 11px; color: #888888;">
                    Demo Accounts: demo / user123 | Operator: operator / operator123
                </p>
            </div>
            <div id="registerForm" class="tab-content">
                <form onsubmit="register(event)">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="regUsername" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="regEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="regPassword" required>
                    </div>
                    <button type="submit" style="width: 100%;">Register</button>
                </form>
            </div>
        </div>
    `;
}

function switchAuthTab(tab) {
    document.querySelectorAll('#authContainer .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#authContainer .tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('#authContainer .tab').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('#authContainer .tab')[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (data.success) {
            showAlert('Login successful', 'success');
            checkAuth();
        } else {
            showAlert('Login failed: ' + data.error, 'error');
        }
    } catch (error) {
        showAlert('Login failed', 'error');
    }
}

async function register(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        if (data.success) {
            showAlert('Registration successful. Please login.', 'success');
            switchAuthTab('login');
        } else {
            showAlert('Registration failed: ' + data.error, 'error');
        }
    } catch (error) {
        showAlert('Registration failed', 'error');
    }
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    currentUser = null;
    checkAuth();
}

// ========== HELPER FUNCTIONS ==========
function showAlert(message, type) {
    const container = document.getElementById('appContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = message;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    if (tabName === 'found') loadFoundItems();
    if (tabName === 'claims') loadMyClaims();
    if (tabName === 'pending') loadPendingClaims();
}

function closeModal() {
    document.getElementById('answerModal').style.display = 'none';
    currentClaimId = null;
}

function closeAnswersModal() {
    document.getElementById('answersModal').style.display = 'none';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== AI QUESTION GENERATOR ==========
// This function automatically generates verification questions from private info
function generateVerificationQuestions(privateInfo) {
    const questions = [];
    const text = privateInfo.toLowerCase();
    
    // Question templates based on keywords found in private info
    const patterns = [
        {
            keywords: ['color', 'coloured', 'colored', 'red', 'blue', 'green', 'black', 'white', 'yellow', 'brown'],
            template: (match) => `What color is the ${match}?`
        },
        {
            keywords: ['inside', 'interior', 'inner', 'pocket', 'compartment'],
            template: () => `What is inside the item? Describe any contents.`
        },
        {
            keywords: ['sticker', 'decal', 'label', 'tag', 'brand'],
            template: () => `Are there any stickers, labels, or tags? Describe them.`
        },
        {
            keywords: ['scratch', 'damage', 'crack', 'broken', 'mark', 'stain'],
            template: () => `Describe any unique marks, scratches, or damage on the item.`
        },
        {
            keywords: ['key', 'keys', 'keychain', 'fob'],
            template: () => `Describe any keys or keychains attached to the item.`
        },
        {
            keywords: ['wallet', 'card', 'id', 'license', 'identification'],
            template: () => `What cards or identification are inside?`
        },
        {
            keywords: ['phone', 'charger', 'cable', 'usb', 'cable'],
            template: () => `What electronic items or accessories are with this item?`
        },
        {
            keywords: ['paper', 'note', 'receipt', 'ticket', 'document'],
            template: () => `Describe any papers, receipts, or documents inside.`
        },
        {
            keywords: ['brand', 'logo', 'make', 'model'],
            template: () => `What brand or logo is on the item?`
        },
        {
            keywords: ['size', 'measurement', 'inch', 'cm', 'centimeter'],
            template: () => `What is the approximate size or dimensions?`
        },
        {
            keywords: ['material', 'fabric', 'leather', 'plastic', 'metal', 'wood'],
            template: () => `What material is the item made of?`
        },
        {
            keywords: ['zipper', 'button', 'snap', 'velcro', 'magnet'],
            template: () => `Describe the closure mechanism (zipper, buttons, etc.).`
        }
    ];
    
    // Check each pattern against the private info
    for (const pattern of patterns) {
        for (const keyword of pattern.keywords) {
            if (text.includes(keyword)) {
                let question = pattern.template(keyword);
                // Make sure we don't add duplicate questions
                if (!questions.includes(question)) {
                    questions.push(question);
                }
                break; // Only add one question per pattern
            }
        }
    }
    
    // Add a general catch-all question if no specific patterns matched
    if (questions.length === 0) {
        questions.push("Describe the item in detail. What makes it unique?");
        questions.push("What specific feature would only the owner know about?");
    }
    
    // Add a general verification question
    questions.push("Is there anything else unique about this item that only the owner would know?");
    
    // Return maximum 5 questions
    return questions.slice(0, 5);
}

// ========== USER DASHBOARD ==========
function renderUserDashboard(container) {
    container.innerHTML = `
        <div class="tabs">
            <button class="tab active" onclick="switchTab('found')">Found Items</button>
            <button class="tab" onclick="switchTab('lost')">Report Lost</button>
            <button class="tab" onclick="switchTab('report')">Report Found</button>
            <button class="tab" onclick="switchTab('claims')">My Claims</button>
            <button class="tab" onclick="logout()">Logout</button>
        </div>
        
        <div id="foundTab" class="tab-content active">
            <h2>Available Found Items</h2>
            <div id="foundItemsList" class="items-grid">
                <div class="loading">Loading items...</div>
            </div>
        </div>
        
        <div id="lostTab" class="tab-content">
            <div class="form-container">
                <h2>Report Lost Item</h2>
                <form id="lostItemForm" onsubmit="reportLostItem(event)">
                    <div class="form-group">
                        <label>Description *</label>
                        <textarea id="lostDescription" required placeholder="Describe your lost item..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Location Lost *</label>
                        <input type="text" id="lostLocation" required placeholder="e.g., Central Park, Bus 42">
                    </div>
                    <div class="form-group">
                        <label>Date Lost *</label>
                        <input type="date" id="lostDate" required>
                    </div>
                    <div class="form-group">
                        <label>Photo (optional)</label>
                        <input type="file" id="lostPhoto" accept="image/*">
                    </div>
                    <button type="submit">Submit Lost Report</button>
                </form>
            </div>
        </div>
        
        <div id="reportTab" class="tab-content">
            <div class="form-container">
                <h2>Report Found Item</h2>
                <form id="foundItemForm" onsubmit="reportFoundItem(event)">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" id="foundTitle" required placeholder="e.g., Black Backpack">
                    </div>
                    <div class="form-group">
                        <label>Public Description *</label>
                        <textarea id="foundDescription" required placeholder="Describe the item (visible to everyone)"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Location Found *</label>
                        <input type="text" id="foundLocation" required>
                    </div>
                    <div class="form-group">
                        <label>Date Found *</label>
                        <input type="date" id="foundDate" required>
                    </div>
                    <div class="form-group">
                        <label>Public Details (visible to all)</label>
                        <textarea id="publicDetails" placeholder="Color, brand, size, etc."></textarea>
                    </div>
                    <div class="form-group">
                        <label style="color: #d0a060;">PRIVATE DETAILS (Only operator sees - AI will generate questions from this) *</label>
                        <textarea id="privateInfo" required placeholder="Example: Inside left pocket has a blue key with red tape, back has a scratch, contains a red notebook with 'John' written on it..."></textarea>
                        <small>The system will automatically generate verification questions based on these details</small>
                    </div>
                    <div class="form-group">
                        <label>Photo *</label>
                        <input type="file" id="foundPhoto" accept="image/*" required>
                    </div>
                    <button type="submit">Submit Found Report</button>
                </form>
            </div>
        </div>
        
        <div id="claimsTab" class="tab-content">
            <h2>My Claims</h2>
            <div id="myClaimsList" class="items-grid">
                <div class="loading">Loading your claims...</div>
            </div>
        </div>
    `;
    
    loadFoundItems();
    loadMyClaims();
}

async function loadFoundItems() {
    try {
        const response = await fetch('/api/found-items');
        const items = await response.json();
        const container = document.getElementById('foundItemsList');
        
        if (items.length === 0) {
            container.innerHTML = '<div class="loading">No items found yet. Be the first to report one.</div>';
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="item-card">
                ${item.photo_url ? `<img src="${item.photo_url}" alt="${item.title}">` : '<div style="height:200px; background:#1a1a1a; display:flex; align-items:center; justify-content:center;">No image</div>'}
                <div class="item-card-content">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p><strong>Location:</strong> ${escapeHtml(item.location)}</p>
                    <p><strong>Found:</strong> ${new Date(item.found_date).toLocaleDateString()}</p>
                    <p><strong>Details:</strong> ${escapeHtml(item.public_details || item.description)}</p>
                    <span class="badge badge-open">Open for claims</span>
                    <button onclick="claimItem(${item.id})" style="margin-top: 15px; width: 100%;">Claim This Item</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading found items:', error);
    }
}

async function claimItem(itemId) {
    if (!confirm('Are you sure you want to claim this item? The system will ask you verification questions to prove ownership.')) return;
    
    try {
        const response = await fetch('/api/claims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ found_item_id: itemId })
        });
        
        const data = await response.json();
        if (data.success) {
            showAlert(data.message, 'success');
            loadMyClaims();
        } else {
            showAlert(data.error, 'error');
        }
    } catch (error) {
        showAlert('Error submitting claim', 'error');
    }
}

async function reportFoundItem(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('foundTitle').value);
    formData.append('description', document.getElementById('foundDescription').value);
    formData.append('location', document.getElementById('foundLocation').value);
    formData.append('found_date', document.getElementById('foundDate').value);
    formData.append('public_details', document.getElementById('publicDetails').value);
    
    const privateInfo = document.getElementById('privateInfo').value;
    formData.append('operator_private_info', privateInfo);
    
    // Auto-generate questions from private info
    const autoQuestions = generateVerificationQuestions(privateInfo);
    formData.append('auto_questions', JSON.stringify(autoQuestions));
    
    formData.append('photo', document.getElementById('foundPhoto').files[0]);
    
    try {
        const response = await fetch('/api/found-items', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            showAlert('Found item reported successfully! Auto-generated ' + autoQuestions.length + ' verification questions.', 'success');
            document.getElementById('foundItemForm').reset();
            loadFoundItems();
        } else {
            showAlert('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showAlert('Error reporting item', 'error');
    }
}

async function reportLostItem(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('description', document.getElementById('lostDescription').value);
    formData.append('location_lost', document.getElementById('lostLocation').value);
    formData.append('date_lost', document.getElementById('lostDate').value);
    const photo = document.getElementById('lostPhoto').files[0];
    if (photo) formData.append('photo', photo);
    
    try {
        const response = await fetch('/api/lost-items', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            showAlert('Lost item reported. We will notify you if found.', 'success');
            document.getElementById('lostItemForm').reset();
        } else {
            showAlert('Error reporting lost item', 'error');
        }
    } catch (error) {
        showAlert('Error reporting lost item', 'error');
    }
}

async function loadMyClaims() {
    try {
        const response = await fetch('/api/my-claims');
        const claims = await response.json();
        const container = document.getElementById('myClaimsList');
        
        if (!container) return;
        
        if (claims.length === 0) {
            container.innerHTML = '<div class="loading">You have not claimed any items yet.</div>';
            return;
        }
        
        container.innerHTML = claims.map(claim => `
            <div class="item-card">
                <div class="item-card-content">
                    <h3>${escapeHtml(claim.title)}</h3>
                    <p><strong>Status:</strong> <span class="badge badge-${claim.status}">${claim.status.toUpperCase()}</span></p>
                    <p><strong>Location:</strong> ${escapeHtml(claim.location)}</p>
                    <p><strong>Claimed:</strong> ${new Date(claim.created_at).toLocaleDateString()}</p>
                    ${claim.status === 'pending' ? '<p style="color:#d0c0a0; margin-top:10px;">Waiting for your answers. Please answer the verification questions.</p>' : ''}
                    ${claim.status === 'approved' ? '<p style="color:#a0d0a0; margin-top:10px;">Claim approved. Contact the operator to arrange pickup.</p>' : ''}
                    ${claim.status === 'rejected' ? '<p style="color:#d0a0a0; margin-top:10px;">Claim rejected. Verification failed.</p>' : ''}
                    ${claim.status === 'pending' ? `<button onclick="checkAndAnswerQuestions(${claim.id})" style="margin-top: 15px; width: 100%;">Answer Verification Questions</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading claims:', error);
    }
}

async function checkAndAnswerQuestions(claimId) {
    try {
        const response = await fetch(`/api/claims/${claimId}/questions`);
        const questions = await response.json();
        
        if (questions.length === 0) {
            showAlert('No questions available yet. Please check back soon.', 'info');
            return;
        }
        
        currentClaimId = claimId;
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div id="questionsContainer">
                <p style="margin-bottom: 15px; color: #d0c0a0;">Please answer these verification questions honestly. Your answers will be compared with the item's private details.</p>
                ${questions.map((q, index) => `
                    <div class="question-card">
                        <p><strong>Question ${index + 1}:</strong> ${escapeHtml(q.question)}</p>
                        <textarea id="answer_${q.id}" placeholder="Your answer..." rows="3"></textarea>
                    </div>
                `).join('')}
            </div>
            <button onclick="submitAnswers(${claimId})" style="width: 100%; margin-top: 10px;">Submit All Answers</button>
        `;
        document.getElementById('answerModal').style.display = 'flex';
    } catch (error) {
        showAlert('Error loading questions', 'error');
    }
}

async function submitAnswers(claimId) {
    const questions = document.querySelectorAll('#questionsContainer .question-card');
    const answers = [];
    
    for (let i = 0; i < questions.length; i++) {
        const textarea = questions[i].querySelector('textarea');
        const questionId = textarea.id.split('_')[1];
        answers.push({ question_id: parseInt(questionId), answer: textarea.value });
    }
    
    try {
        for (const answer of answers) {
            await fetch(`/api/claims/${claimId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_id: answer.question_id, answer: answer.answer })
            });
        }
        showAlert('Answers submitted successfully. The operator will review them shortly.', 'success');
        closeModal();
        loadMyClaims();
    } catch (error) {
        showAlert('Error submitting answers', '
