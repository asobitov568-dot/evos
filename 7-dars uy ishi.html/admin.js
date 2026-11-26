const receiptStorageKey = 'evosReceipts';
let receipts = [];

function loadReceipts() {
    try {
        const saved = localStorage.getItem(receiptStorageKey);
        if (!saved) return [];

        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (error) {
        console.error('Cheklar brauzer xotirasidan o‘qib bo‘lmadi:', error);
        return [];
    }
}

function appendReceiptDetails(receipt, container) {
    const id = document.createElement('p');
    id.innerHTML = `<strong>Buyurtma № ${receipt.id}</strong>`;
    container.appendChild(id);

    const date = document.createElement('p');
    date.textContent = `Vaqti: ${new Date(receipt.createdAt).toLocaleString('uz-UZ')}`;
    container.appendChild(date);

    const customer = document.createElement('p');
    customer.textContent = `Mijoz: ${receipt.customerName || '-'}`;
    container.appendChild(customer);

    const phone = document.createElement('p');
    phone.textContent = `Telefon: ${receipt.phone || '-'}`;
    container.appendChild(phone);

    const address = document.createElement('p');
    address.textContent = `Manzil: ${receipt.address || '-'}`;
    container.appendChild(address);

    const itemsHeading = document.createElement('p');
    itemsHeading.innerHTML = '<strong>Mahsulotlar:</strong>';
    container.appendChild(itemsHeading);

    const items = document.createElement('ul');
    (receipt.items || []).forEach(item => {
        const listItem = document.createElement('li');
        const lineTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
        listItem.textContent =
            `${item.name} — ${item.quantity} ta — ${lineTotal.toLocaleString('uz-UZ')} so'm`;
        items.appendChild(listItem);
    });
    container.appendChild(items);

    const total = document.createElement('p');
    total.innerHTML = `<strong>Jami: ${(receipt.total || 0).toLocaleString('uz-UZ')} so'm</strong>`;
    container.appendChild(total);
}

function renderOrders() {
    const list = document.getElementById('adminPageOrderList');
    const count = document.getElementById('adminPageOrderCount');
    const empty = document.getElementById('adminPageEmpty');
    if (!list || !count || !empty) return;

    while (list.firstChild) list.removeChild(list.firstChild);

    const today = new Date();
    const todayOrders = receipts.filter(receipt => {
        const orderDate = new Date(receipt.createdAt);
        return orderDate.getFullYear() === today.getFullYear()
            && orderDate.getMonth() === today.getMonth()
            && orderDate.getDate() === today.getDate();
    });
    const todayTotal = todayOrders.reduce((sum, receipt) => sum + (Number(receipt.total) || 0), 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);
    const weekOrders = receipts.filter(receipt => new Date(receipt.createdAt) >= weekAgo);

    const productTotals = {};
    todayOrders.forEach(receipt => {
        (receipt.items || []).forEach(item => {
            productTotals[item.name] = (productTotals[item.name] || 0) + (Number(item.quantity) || 0);
        });
    });
    const topProduct = Object.entries(productTotals).sort((a, b) => b[1] - a[1])[0];

    document.getElementById('adminTodayCount').textContent = todayOrders.length;
    document.getElementById('adminTodayTotal').textContent =
        `${todayTotal.toLocaleString('uz-UZ')} so'm`;
    document.getElementById('adminWeekCount').textContent = weekOrders.length;
    document.getElementById('adminTopProduct').textContent = topProduct ? topProduct[0] : '-';
    count.textContent =
        `Bugun: ${todayOrders.length} buyurtma | Jami: ${todayTotal.toLocaleString('uz-UZ')} so'm`;

    const chart = document.getElementById('adminWeekChart');
    if (chart) {
        chart.replaceChildren();
        let maxValue = 1;
        const weekValues = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const value = receipts
                .filter(receipt => new Date(receipt.createdAt).toDateString() === date.toDateString())
                .reduce((sum, receipt) => sum + (Number(receipt.total) || 0), 0);
            weekValues.push({ date, value });
            maxValue = Math.max(maxValue, value);
        }

        weekValues.forEach(({ date, value }) => {
            const bar = document.createElement('div');
            bar.className = 'week-bar';
            const fill = document.createElement('div');
            fill.className = 'week-bar-fill';
            fill.style.height = `${Math.max(4, (value / maxValue) * 210)}px`;
            const label = document.createElement('span');
            label.className = 'week-bar-label';
            label.textContent = date.toLocaleDateString('uz-UZ', { weekday: 'short' });
            bar.append(fill, label);
            chart.appendChild(bar);
        });
    }

    const recentList = document.getElementById('adminRecentList');
    if (recentList) {
        recentList.replaceChildren();
        [...receipts].reverse().slice(0, 6).forEach(receipt => {
            const row = document.createElement('div');
            row.className = 'admin-recent-item';
            const id = document.createElement('strong');
            id.textContent = receipt.id;
            const total = document.createElement('span');
            total.textContent = `${(Number(receipt.total) || 0).toLocaleString('uz-UZ')} so'm`;
            row.append(id, total);
            recentList.appendChild(row);
        });
    }
    empty.hidden = receipts.length > 0;

    receipts.forEach((receipt, index) => {
        const card = document.createElement('article');
        card.className = 'admin-order-card';

        const summary = document.createElement('div');
        summary.className = 'admin-order-summary';

        const title = document.createElement('h3');
        title.textContent = `Buyurtma № ${receipt.id}`;
        summary.appendChild(title);

        const date = document.createElement('p');
        const orderDate = new Date(receipt.createdAt);
        const isToday = orderDate.toDateString() === new Date().toDateString();
        date.textContent =
            `${isToday ? 'Bugun — ' : ''}Olingan vaqti: ${orderDate.toLocaleString('uz-UZ')}`;
        summary.appendChild(date);

        const customer = document.createElement('p');
        customer.textContent = `Mijoz: ${receipt.customerName || '-'}`;
        summary.appendChild(customer);

        const phone = document.createElement('p');
        phone.textContent = `Telefon: ${receipt.phone || '-'}`;
        summary.appendChild(phone);

        const address = document.createElement('p');
        address.textContent = `Manzil: ${receipt.address || '-'}`;
        summary.appendChild(address);

        const itemsHeading = document.createElement('p');
        itemsHeading.textContent = 'Olingan mahsulotlar:';
        summary.appendChild(itemsHeading);

        const itemsList = document.createElement('ul');
        (receipt.items || []).forEach(item => {
            const listItem = document.createElement('li');
            const lineTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
            listItem.textContent =
                `${item.name} — ${item.quantity} ta — ${lineTotal.toLocaleString('uz-UZ')} so'm`;
            itemsList.appendChild(listItem);
        });
        summary.appendChild(itemsList);

        const total = document.createElement('p');
        total.textContent = `Jami: ${(receipt.total || 0).toLocaleString('uz-UZ')} so'm`;
        summary.appendChild(total);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'checkout-button';
        button.dataset.orderIndex = index;
        button.textContent = 'Tafsilotlarini ko‘rish';

        card.appendChild(summary);
        card.appendChild(button);
        list.appendChild(card);
    });
}

const accessGranted = new URLSearchParams(window.location.search).get('authenticated') === '1';
const accessSection = document.getElementById('adminPageAccess');
const contentSection = document.getElementById('adminPageContent');

if (!accessGranted) {
    if (accessSection) accessSection.hidden = false;
    if (contentSection) contentSection.hidden = true;
} else {
    receipts = loadReceipts();
    renderOrders();
}

document.getElementById('closeAdminPageBtn')?.addEventListener('click', () => window.close());

window.addEventListener('storage', event => {
    if (event.key === receiptStorageKey) {
        receipts = loadReceipts();
        renderOrders();
    }
});

const detailsModal = document.getElementById('adminPageDetailsModal');
const detailsContainer = document.getElementById('adminPageDetails');
document.getElementById('adminPageOrderList')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-order-index]');
    if (!button) return;

    const receipt = receipts[Number(button.dataset.orderIndex)];
    if (!receipt) return;

    while (detailsContainer.firstChild) detailsContainer.removeChild(detailsContainer.firstChild);
    appendReceiptDetails(receipt, detailsContainer);
    detailsModal.classList.add('active');
});

document.getElementById('closeAdminPageDetailsBtn')?.addEventListener('click', () => {
    detailsModal.classList.remove('active');
});
detailsModal?.addEventListener('click', event => {
    if (event.target === detailsModal) detailsModal.classList.remove('active');
});

const menuModal = document.getElementById('adminPageMenuModal');
document.getElementById('adminPageMenuButton')?.addEventListener('click', async () => {
    const menuList = document.getElementById('adminPageMenuList');
    const menuCount = document.getElementById('adminPageMenuCount');

    while (menuList.firstChild) menuList.removeChild(menuList.firstChild);

    try {
        const response = await fetch('index.html');
        if (!response.ok) throw new Error(`Sahifa yuklanmadi: ${response.status}`);

        const html = await response.text();
        const parsedPage = new DOMParser().parseFromString(html, 'text/html');
        const cards = parsedPage.querySelectorAll('.product-card');
        menuCount.textContent = `(${cards.length} ta)`;

        cards.forEach(card => {
            const title = card.querySelector('h3');
            const price = card.querySelector('p');
            if (!title || !price) return;

            const item = document.createElement('p');
            item.className = 'admin-menu-item';
            item.textContent = `${title.textContent.trim()} — ${price.textContent.trim()}`;
            menuList.appendChild(item);
        });
    } catch (error) {
        console.error('Mahsulotlar ro‘yxatini yuklab bo‘lmadi:', error);
        menuCount.textContent = '(0 ta)';
        const item = document.createElement('p');
        item.className = 'admin-menu-item';
        item.textContent = 'Mahsulotlar ro‘yxatini yuklab bo‘lmadi.';
        menuList.appendChild(item);
    }

    menuModal.classList.add('active');
});

document.getElementById('closeAdminPageMenuBtn')?.addEventListener('click', () => {
    menuModal.classList.remove('active');
});
menuModal?.addEventListener('click', event => {
    if (event.target === menuModal) menuModal.classList.remove('active');
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        menuModal?.classList.remove('active');
        detailsModal?.classList.remove('active');
    }
});
