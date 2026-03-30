// Mock Data
const state = {
    currentSection: 'dashboard',
    appointments: [
        { id: 1, time: '10:00', client: 'Mario R.', artist: 'Mario R.', service: 'Realistico', status: 'confirmed' },
        { id: 2, time: '11:30', client: 'Sofia L.', artist: 'Sofia L.', service: 'Tradizionale', status: 'pending' },
        { id: 3, time: '14:00', client: 'Luca B.', artist: 'Luca B.', service: 'Giapponese', status: 'confirmed' }
    ],
    customers: [
        { 
            name: 'Mario Rossi', 
            phone: '+39 333 1234567', 
            email: 'mario.rossi@email.com', 
            style: 'Realistico B/N', 
            lastVisit: '12/01/2026',
            dob: '15/03/1990',
            allergies: 'Nessuna',
            history: [
                { date: '12/01/2026', desc: 'Leopardo spalla dx (6h)', note: 'Cliente soddisfatto, richiede ritocco fra 30gg' },
                { date: '03/09/2025', desc: 'Scritto avambraccio sx (2h)', note: 'Prima esperienza, un po\' nervoso' }
            ]
        },
        { name: 'Sofia Lanza', phone: '+39 333 7654321', email: 'sofia.l@email.com', style: 'Traditional', lastVisit: '20/02/2026' },
        { name: 'Luca Bianchi', phone: '+39 333 1112223', email: 'luca.b@email.com', style: 'Irezumi', lastVisit: '05/03/2026' }
    ],
    artists: [
        { name: 'Mario R.', style: 'Realistico', color: '#00BFFF', shifts: ['Mattina', 'Mattina', 'Riposo', 'Tutta la Giornata', 'Pomeriggio', 'Riposo', 'Riposo'] },
        { name: 'Sofia L.', style: 'Tradizionale', color: '#87CEEB', shifts: ['Pomeriggio', 'Riposo', 'Mattina', 'Mattina', 'Riposo', 'Tutta la Giornata', 'Riposo'] },
        { name: 'Luca B.', style: 'Giapponese', color: '#ffffff', shifts: ['Riposo', 'Tutta la Giornata', 'Pomeriggio', 'Riposo', 'Mattina', 'Pomeriggio', 'Riposo'] }
    ],
    financeEntries: [
        { id: 1, date: '24/03/2026', desc: 'Acconto Mario Rossi', amount: 150, type: 'entrata' },
        { id: 2, date: '23/03/2026', desc: 'Acquisto Aghi & Inchiostri', amount: 85, type: 'uscita' },
        { id: 3, date: '22/03/2026', desc: 'Affitto Studio (Marzo)', amount: 1200, type: 'uscita' },
        { id: 4, date: '21/03/2026', desc: 'Sessione Luca Bianchi', amount: 450, type: 'entrata' }
    ]
};

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    setupNavigation();
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            if (!section) return;
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            navigate(section);
        });
    });
}

function navigate(section) {
    state.currentSection = section;
    const mainView = document.getElementById('main-view');
    
    gsap.to(mainView, { opacity: 0, y: 15, filter: 'blur(10px)', duration: 0.3, onComplete: () => {
        mainView.innerHTML = '';
        switch(section) {
            case 'dashboard': renderDashboard(); break;
            case 'calendar': renderCalendar(); break;
            case 'customers': renderCustomers(); break;
            case 'artists': renderArtists(); break;
            case 'finance': renderFinance(); break;
            default: mainView.innerHTML = `<h2>Sezione ${section} in sviluppo</h2>`;
        }
        gsap.to(mainView, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: "back.out(1.7)" });
    }});
}

function renderDashboard() {
    const mainView = document.getElementById('main-view');
    mainView.style.overflow = 'hidden'; // Force contain dashboard
    mainView.innerHTML = `
        <div class="header" style="margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="logo.png" style="width: 42px; height: 42px; border-radius: 10px; box-shadow: 0 0 15px rgba(0, 191, 255, 0.4);">
                <div>
                    <h2 style="font-size: 1.8rem; font-weight: 800; letter-spacing: -1px;">Nagma Tattoo</h2>
                    <p style="color: var(--accent-color); font-weight: 600; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 2px;">Management Suite</p>
                </div>
            </div>
            <div style="display: flex; gap: 1.2rem; align-items: center;">
                <div style="text-align: right;">
                    <div style="font-size: 0.8rem; font-weight: 700;">GIOVANNI V.</div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary);">Proprietario</div>
                </div>
                <div style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--accent-color); padding: 2px;">
                    <div style="width: 100%; height: 100%; background: #222; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--accent-color);">GV</div>
                </div>
            </div>
        </div>

        <div class="bento-grid">
            <div class="bento-item bento-1">
                <h3 style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.75rem;">STATO STUDIO</h3>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 10px; height: 10px; background: var(--success); border-radius: 50%; box-shadow: 0 0 12px var(--success);"></div>
                    <span style="font-size: 1.1rem; font-weight: 700;">Studio Operativo</span>
                </div>
                <div style="margin-top: auto; display: flex; gap: 2rem;">
                    <div><div style="font-size: 1.3rem; font-weight: 800;">€2.4K</div><div style="font-size: 0.6rem; color: var(--text-secondary);">FATTURATO OGGI</div></div>
                    <div><div style="font-size: 1.3rem; font-weight: 800;">8</div><div style="font-size: 0.6rem; color: var(--text-secondary);">CLIENTI OGGI</div></div>
                </div>
            </div>

            <div class="bento-item bento-2" style="text-align: center; justify-content: center;">
                <ion-icon name="flash-outline" style="font-size: 2.2rem; color: var(--accent-color); margin-bottom: 0.25rem; align-self: center;"></ion-icon>
                <div style="font-weight: 800; font-size: 1.1rem;">92%</div>
                <div style="font-size: 0.6rem; color: var(--text-secondary);">READY SCORE</div>
            </div>

            <div class="bento-item bento-3" style="align-items: center; justify-content: space-between;">
                <h3 style="font-size: 0.7rem; color: var(--text-secondary); align-self: flex-start;">BILANCIO</h3>
                <div style="width: 130px; height: 130px; margin: 0.5rem 0;">
                    <canvas id="financeChart"></canvas>
                </div>
                <div style="font-weight: 700; color: var(--accent-color); font-size: 1.1rem;">€8,500.00</div>
            </div>

            <div class="bento-item bento-4">
                <div class="card-header" style="margin-bottom: 1rem;">
                    <h3 style="font-size: 0.9rem;">Agenda Odierna</h3>
                    <ion-icon name="notifications-outline" style="color: var(--accent-color); font-size: 1.3rem; cursor: pointer;"></ion-icon>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; flex: 1; padding-right: 5px;" class="sidebar-scroll">
                    ${state.appointments.map(app => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border-radius: 15px; border: 1px solid var(--surface-border);">
                            <div style="display: flex; gap: 0.75rem; align-items: center;">
                                <div style="width: 32px; height: 32px; background: #111; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent-color); font-weight: 800; border: 1px solid var(--accent-color); font-size: 0.8rem;">${app.client[0]}</div>
                                <div>
                                    <div style="font-weight: 700; font-size: 0.85rem;">${app.client}</div>
                                    <div style="font-size: 0.65rem; color: var(--text-secondary);">${app.time} - ${app.service}</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <ion-icon name="logo-whatsapp" style="color: var(--success); cursor: pointer; font-size: 1.1rem;"></ion-icon>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="bento-item bento-5">
                <h3 style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.5rem;">NEXT ARTIST</h3>
                <div style="font-weight: 700; font-size: 0.9rem;">Mario R.</div>
                <div style="font-size: 0.65rem; color: var(--accent-color);">10:00 - Mattina</div>
            </div>
        </div>
    `;
    
    setTimeout(() => initChart(), 100);
}

function renderFinance() {
    const mainView = document.getElementById('main-view');
    const totalEntrate = state.financeEntries.filter(e => e.type === 'entrata').reduce((acc, curr) => acc + curr.amount, 0);
    const totalUscite = state.financeEntries.filter(e => e.type === 'uscita').reduce((acc, curr) => acc + curr.amount, 0);
    const bilancio = totalEntrate - totalUscite;

    // Filter to show only outgoings as requested
    const outgoings = state.financeEntries.filter(e => e.type === 'uscita');

    mainView.innerHTML = `
        <div class="header">
            <div class="header-title">
                <h2>Gestione Uscite</h2>
                <p>Monitoraggio delle spese dello studio.</p>
            </div>
            <button class="btn-primary" onclick="openModal('modal-finance')">
                <ion-icon name="add-circle-outline"></ion-icon>
                Registra Spesa
            </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 3rem;">
            <div class="bento-item" style="padding: 2rem; border-color: var(--danger); background: rgba(255, 82, 82, 0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Totale Uscite Periodo</div>
                        <div style="font-size: 2.5rem; font-weight: 800; color: var(--danger);">- €${totalUscite.toLocaleString()}</div>
                    </div>
                    <ion-icon name="trending-down-outline" style="font-size: 3rem; color: var(--danger); opacity: 0.5;"></ion-icon>
                </div>
            </div>
        </div>
        <div class="card" style="padding: 2rem; border-radius: 35px; border: 1px solid var(--surface-border); background: rgba(255,255,255,0.02);">
            <div class="card-header" style="margin-bottom: 1.5rem;">
                <h3>Registro Uscite</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="glass-btn" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Export PDF</button>
                    <button class="glass-btn" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Mese Corrente</button>
                </div>
            </div>
            <table class="finance-table">
                <thead>
                    <tr style="color: var(--text-secondary); font-size: 0.8rem; text-align: left;">
                        <th style="padding: 1rem;">DATA</th>
                        <th style="padding: 1rem;">DESCRIZIONE</th>
                        <th style="padding: 1rem;">TIPO</th>
                        <th style="padding: 1rem; text-align: right;">IMPORTO</th>
                        <th style="padding: 1rem; text-align: center;">AZIONI</th>
                    </tr>
                </thead>
                <tbody id="finance-body">
                    ${outgoings.map(e => `
                        <tr>
                            <td style="font-weight: 700; color: var(--accent-color);">${e.date}</td>
                            <td>${e.desc}</td>
                            <td><span class="type-tag tag-${e.type}">${e.type}</span></td>
                            <td style="text-align: right; font-weight: 800; color: var(--danger)">
                                - €${e.amount.toLocaleString()}
                            </td>
                            <td style="text-align: center;">
                                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                    <ion-icon name="create-outline" style="cursor: pointer; color: var(--text-secondary);"></ion-icon>
                                    <ion-icon name="trash-outline" style="cursor: pointer; color: var(--danger);"></ion-icon>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function initChart() {
    const canvas = document.getElementById('financeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Entrate', 'Uscite'],
            datasets: [{
                data: [
                    state.financeEntries.filter(e => e.type === 'entrata').reduce((acc, curr) => acc + curr.amount, 0),
                    state.financeEntries.filter(e => e.type === 'uscita').reduce((acc, curr) => acc + curr.amount, 0)
                ],
                backgroundColor: ['#00BFFF', 'rgba(255, 255, 255, 0.05)'],
                borderColor: ['#00BFFF', 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '85%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#080808',
                    titleColor: '#00BFFF',
                    bodyColor: '#ffffff',
                    displayColors: false
                }
            }
        }
    });
}

// Logic for Adding Transactions
window.confirmTransaction = function() {
    const desc = document.getElementById('fin-desc').value;
    const amount = parseFloat(document.getElementById('fin-amount').value);
    const type = document.getElementById('fin-type').value;
    
    if (!desc || isNaN(amount)) {
        alert("Inserisci tutti i dati!");
        return;
    }

    const newEntry = {
        id: state.financeEntries.length + 1,
        date: new Date().toLocaleDateString('it-IT'),
        desc: desc,
        amount: amount,
        type: type
    };

    state.financeEntries.unshift(newEntry);
    closeModal('modal-finance');
    
    // Refresh if in finance section
    if (state.currentSection === 'finance') {
        renderFinance();
    } else {
        renderDashboard();
    }
    
    showToast("Transazione registrata con successo!");
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.display = 'block';
    gsap.fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    
    setTimeout(() => {
        gsap.to(toast, { y: 20, opacity: 0, duration: 0.4, onComplete: () => {
            toast.style.display = 'none';
        }});
    }, 3000);
}

// Modal Logic
window.openModal = function(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    gsap.fromTo(modal.querySelector('.modal'), { scale: 0.9, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" });
}

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    gsap.to(modal.querySelector('.modal'), { scale: 0.9, opacity: 0, y: 30, duration: 0.3, onComplete: () => {
        modal.style.display = 'none';
    }});
}

// Existing views (Calendar, Customers, Artists) remained similar but with UI polish
// For this demo, we assume they are inherited or updated in a similar bento-ish way if needed
function renderCalendar() {
    const mainView = document.getElementById('main-view');
    mainView.style.overflow = 'auto'; // Allow scrolling for calendar
    const days = ['Lun 23', 'Mar 24', 'Mer 25', 'Gio 26', 'Ven 27', 'Sab 28', 'Dom 29'];
    
    mainView.innerHTML = `
        <div class="header">
            <div>
                <h2>Agenda Settimanale</h2>
                <p>Marzo 2026 - Settimana 13</p>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button class="glass-btn"><ion-icon name="chevron-back-outline"></ion-icon></button>
                <button class="glass-btn"><ion-icon name="chevron-forward-outline"></ion-icon></button>
                <button class="btn-primary" onclick="openModal('modal-booking')">Nuovo Appuntamento</button>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1rem; flex: 1; min-height: 500px;">
            ${days.map((day, index) => {
                const isToday = index === 1; // Mar 24
                return `
                    <div class="bento-item" style="padding: 1rem; border-top: 3px solid ${isToday ? 'var(--accent-color)' : 'transparent'}; background: ${isToday ? 'rgba(0,191,255,0.03)' : 'var(--surface-color)'}">
                        <div style="font-weight: 800; font-size: 0.75rem; color: ${isToday ? 'var(--accent-color)' : 'var(--text-secondary)'}; margin-bottom: 1rem;">${day.toUpperCase()}</div>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${state.appointments.filter(a => isToday).map(app => `
                                <div style="padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--surface-border); font-size: 0.7rem;">
                                    <div style="font-weight: 800; color: var(--accent-color);">${app.time}</div>
                                    <div style="font-weight: 600;">${app.client}</div>
                                    <div style="font-size: 0.6rem; color: var(--text-secondary);">${app.service}</div>
                                </div>
                            `).join('')}
                            ${!isToday ? '<div style="font-size: 0.6rem; color: var(--text-secondary); text-align: center; margin-top: 2rem; opacity: 0.3;">Nessun impegno</div>' : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderArtists() {
    const mainView = document.getElementById('main-view');
    mainView.style.overflow = 'auto';
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    
    mainView.innerHTML = `
        <div class="header">
            <div>
                <h2>Il Tuo Team</h2>
                <p>Gestione disponibilità e turni settimanali.</p>
            </div>
            <button class="btn-primary" onclick="showToast('Funzione aggiunta artista in arrivo...')">
                <ion-icon name="person-add-outline"></ion-icon>
                Aggiungi Collaboratore
            </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
            ${state.artists.map(a => `
                <div class="bento-item" style="border-top: 4px solid ${a.color}; padding: 1.5rem;">
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; border-radius: 12px; background: #111; display: flex; align-items: center; justify-content: center; color: ${a.color}; border: 1px solid ${a.color}; font-weight: 900; font-size: 1.2rem;">${a.name[0]}</div>
                        <div>
                            <div style="font-weight: 800; font-size: 1.1rem;">${a.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">${a.style}</div>
                        </div>
                        <div style="margin-left: auto; text-align: right;">
                             <div style="font-size: 0.7rem; color: var(--success); font-weight: 700;">● ONLINE</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="card" style="padding: 2rem; border-radius: 35px; border: 1px solid var(--surface-border);">
            <div class="card-header" style="margin-bottom: 2rem;">
                <h3 style="font-size: 1.4rem;">Pianificazione Settimanale</h3>
                <div style="display: flex; gap: 1rem;">
                    <span style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem;"><div style="width: 10px; height: 10px; background: var(--accent-color); border-radius: 50%;"></div> Mattina</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem;"><div style="width: 10px; height: 10px; background: #87CEEB; border-radius: 50%;"></div> Pomeriggio</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem;"><div style="width: 10px; height: 10px; background: #fff; border-radius: 50%;"></div> Giornata</span>
                </div>
            </div>
            
            <div style="overflow-x: auto;">
                <table class="shift-matrix-table">
                    <thead>
                        <tr>
                            <th style="text-align: left; width: 150px;">ARTISTA</th>
                            ${days.map(d => `<th>${d.toUpperCase()}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${state.artists.map(a => `
                            <tr>
                                <td style="text-align: left; font-weight: 800; font-size: 1rem; border-right: 2px solid var(--surface-border);">${a.name}</td>
                                ${a.shifts.map((s, i) => `
                                    <td>
                                        <div class="shift-badge shift-${s.replace(/ /g, '-').toLowerCase()}" onclick="toggleShift('${a.name}', ${i})">
                                            ${s === 'Riposo' ? '<ion-icon name="moon-outline"></ion-icon>' : s[0]}
                                            <span>${s}</span>
                                        </div>
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderCustomers() {
    const mainView = document.getElementById('main-view');
    mainView.style.overflow = 'auto';

    mainView.innerHTML = `
        <div class="header">
            <div>
                <h2>Gestione Clienti</h2>
                <p>Anagrafica completa e storico appuntamenti.</p>
            </div>
            <button class="btn-primary" onclick="showToast('Funzione aggiunta cliente in arrivo...')">
                <ion-icon name="person-add-outline"></ion-icon>
                Nuovo Cliente
            </button>
        </div>

        <div class="card" style="padding: 1.25rem 2rem; border-radius: 20px; margin-bottom: 2rem; border: 1px solid var(--surface-border); background: rgba(255, 255, 255, 0.02); display: flex; align-items: center; gap: 1rem;">
            <ion-icon name="search-outline" style="font-size: 1.4rem; color: var(--accent-color);"></ion-icon>
            <input type="text" id="customer-search" placeholder="Cerca per nome, telefono, email o stile..." style="flex: 1; background: transparent; border: none; color: white; padding: 0.5rem; outline: none; font-size: 1.1rem; font-weight: 500;" onkeyup="filterCustomers()">
        </div>

        <div class="card" style="padding: 2rem; border-radius: 35px; border: 1px solid var(--surface-border); background: rgba(5, 10, 15, 0.4); backdrop-filter: blur(10px);">
            <table class="finance-table">
                <thead>
                    <tr style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">
                        <th style="padding: 1.25rem; text-align: left;">CLIENTE</th>
                        <th style="padding: 1.25rem; text-align: left;">CONTATTO</th>
                        <th style="padding: 1.25rem; text-align: left;">STILE PREFERITO</th>
                        <th style="padding: 1.25rem; text-align: left;">ULTIMA VISITA</th>
                        <th style="padding: 1.25rem; text-align: center;">AZIONI</th>
                    </tr>
                </thead>
                <tbody id="customers-table-body">
                    ${state.customers.map(c => renderCustomerRow(c)).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderCustomerRow(c) {
    return `
        <tr class="customer-row">
            <td style="padding: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(0, 191, 255, 0.1); border: 1px solid rgba(0, 191, 255, 0.3); display: flex; align-items: center; justify-content: center; color: var(--accent-color); font-weight: 800; font-size: 1rem;">${c.name[0]}</div>
                    <div style="font-weight: 700; font-size: 1rem;">${c.name}</div>
                </div>
            </td>
            <td style="padding: 1.25rem;">
                <div style="font-size: 0.9rem; margin-bottom: 0.2rem;">${c.phone}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${c.email}</div>
            </td>
            <td style="padding: 1.25rem;">
                <span class="type-tag tag-entrata" style="font-size: 0.7rem; padding: 0.4rem 0.8rem;">${c.style || 'N/A'}</span>
            </td>
            <td style="padding: 1.25rem; color: var(--text-secondary); font-size: 0.9rem;">
                ${c.lastVisit}
            </td>
            <td style="padding: 1.25rem;">
                <div style="display: flex; gap: 0.75rem; justify-content: center;">
                    <button class="glass-btn" style="padding: 0.5rem; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;" onclick="viewCustomerDetails('${c.name}')">
                        <ion-icon name="eye-outline" style="font-size: 1.1rem;"></ion-icon>
                    </button>
                    <button class="glass-btn" style="padding: 0.5rem; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; color: var(--success);" onclick="window.open('https://wa.me/${c.phone.replace(/[\+\s]/g, '')}')">
                        <ion-icon name="logo-whatsapp" style="font-size: 1.1rem;"></ion-icon>
                    </button>
                    <button class="glass-btn" style="padding: 0.5rem; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                        <ion-icon name="create-outline" style="font-size: 1.1rem;"></ion-icon>
                    </button>
                </div>
            </td>
        </tr>
    `;
}



window.filterCustomers = function() {
    const q = document.getElementById('customer-search').value.toLowerCase();
    const filtered = state.customers.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.phone.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) ||
        (c.style && c.style.toLowerCase().includes(q))
    );
    const tbody = document.getElementById('customers-table-body');
    tbody.innerHTML = filtered.map(c => renderCustomerRow(c)).join('');
}


window.toggleShift = function(artistName, dayIndex) {
    const artist = state.artists.find(a => a.name === artistName);
    const order = ['Riposo', 'Mattina', 'Pomeriggio', 'Tutta la Giornata'];
    const current = artist.shifts[dayIndex];
    const nextIndex = (order.indexOf(current) + 1) % order.length;
    artist.shifts[dayIndex] = order[nextIndex];
    renderArtists();
    showToast(`Turno ${artistName} aggiornato: ${order[nextIndex]}`);
}

window.viewCustomerDetails = function(name) {
    const customer = state.customers.find(c => c.name === name);
    if (!customer) return;
    const mainView = document.getElementById('main-view');
    
    gsap.to(mainView, { opacity: 0, scale: 0.98, duration: 0.3, onComplete: () => {
        mainView.innerHTML = `
            <div class="header">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <button class="glass-btn" style="padding: 0.5rem; border-radius: 50%; font-size: 1.2rem; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;" onclick="navigate('customers')">
                        <ion-icon name="arrow-back-outline"></ion-icon>
                    </button>
                    <div>
                        <h2>Profilo Cliente</h2>
                        <p>${customer.name} - Scheda Anagrafica</p>
                    </div>
                </div>
            </div>

            <div class="bento-grid" style="grid-template-rows: auto auto;">
                <div class="bento-item bento-1" style="grid-column: span 3; grid-row: span 1;">
                    <h3 style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">INFORMAZIONI GENERALI</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
                        <div>
                            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Telefono</div>
                            <div style="font-weight: 700;">${customer.phone}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Email</div>
                            <div style="font-weight: 700;">${customer.email || 'N/A'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Stile Preferito</div>
                            <div style="font-weight: 700; color: var(--accent-color);">${customer.style || 'N/A'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Data di Nascita</div>
                            <div style="font-weight: 700;">${customer.dob || 'N/A'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Ultima Visita</div>
                            <div style="font-weight: 700;">${customer.lastVisit}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Allergie/Note Health</div>
                            <div style="font-weight: 700; color: var(--danger);">${customer.allergies || 'Nessuna'}</div>
                        </div>
                    </div>
                </div>

                <div class="bento-item" style="grid-column: span 1; grid-row: span 2; justify-content: center; align-items: center; text-align: center;">
                    <div style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid var(--accent-color); padding: 5px; margin-bottom: 1rem;">
                        <div style="width: 100%; height: 100%; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 900; color: var(--accent-color);">${customer.name[0]}</div>
                    </div>
                    <h3 style="font-size: 1.5rem;">${customer.name}</h3>
                    <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">
                        <button class="btn-primary" style="width: 100%;">Modifica Profilo</button>
                        <button class="glass-btn" style="width: 100%; color: var(--danger);">Elimina Record</button>
                    </div>
                </div>

                <div class="bento-item bento-4" style="grid-column: span 3; grid-row: span 1; flex: 1; min-height: 250px;">
                    <h3 style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">STORICO LAVORI</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; max-height: 200px;" class="sidebar-scroll">
                        ${customer.history ? customer.history.map(h => `
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--surface-border); padding: 1rem; border-radius: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="font-weight: 800; color: var(--accent-color);">${h.date}</span>
                                    <span style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;">${h.desc}</span>
                                </div>
                                <p style="font-size: 0.8rem; line-height: 1.4; opacity: 0.8;">${h.note}</p>
                            </div>
                        `).join('') : '<p style="text-align: center; opacity: 0.5; margin-top: 2rem;">Nessun lavoro registrato in precedenza.</p>'}
                    </div>
                </div>
            </div>
        `;
        gsap.to(mainView, { opacity: 1, scale: 1, duration: 0.4 });
    }});
}

// Add necessary confirmBooking to avoid errors
window.confirmBooking = function() {
    closeModal('modal-booking');
    showToast("Prenotazione confermata!");
}
