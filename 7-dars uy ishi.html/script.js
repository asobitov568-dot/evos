
// ==========================================
// EVOS MODAL JAVASCRIPT KODI
// ==========================================

const modal = document.getElementById('productModal');
const closeModalBtn = document.getElementById('closeModalBtn');

const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');

const sizeButtons = document.querySelectorAll('.size-btn');
const addonCheckboxes = document.querySelectorAll('.addon-checkbox');

const decreaseQtyBtn = document.getElementById('decreaseQty');
const increaseQtyBtn = document.getElementById('increaseQty');

const qtyValueEl = document.getElementById('qtyValue');
const totalPriceEl = document.getElementById('totalPrice');

const addToCartBtn = document.getElementById('addToCartBtn');
const cartCountEl = document.getElementById('cartCount');
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const closeCartModalBtn = document.getElementById('closeCartModalBtn');
const cartItemsEl = document.getElementById('cartItems');
const emptyCartMessageEl = document.getElementById('emptyCartMessage');
const cartTotalEl = document.getElementById('cartTotal');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const promoDiscountEl = document.getElementById('promoDiscount');
const promoCodeInput = document.getElementById('promoCodeInput');
const applyPromoButton = document.getElementById('applyPromoButton');
const promoMessageEl = document.getElementById('promoMessage');
const cartSummaryEl = document.getElementById('cartSummary');
const checkoutButton = document.getElementById('checkoutButton');
const deliveryForm = document.getElementById('deliveryForm');
const customerNameInput = document.getElementById('customerName');
const phoneNumberInput = document.getElementById('phoneNumber');
const deliveryAddressInput = document.getElementById('deliveryAddress');
const backToCartBtn = document.getElementById('backToCartBtn');
const verificationForm = document.getElementById('verificationForm');
const verificationCodeInput = document.getElementById('verificationCodeInput');
const verificationNoticeEl = document.getElementById('verificationNotice');
const verificationErrorEl = document.getElementById('verificationError');
const backToDeliveryBtn = document.getElementById('backToDeliveryBtn');
const orderSuccessEl = document.getElementById('orderSuccess');
const latestReceiptEl = document.getElementById('latestReceipt');
const orderErrorEl = document.getElementById('orderError');
const receiptsButton = document.getElementById('receiptsButton');
const receiptsModal = document.getElementById('receiptsModal');
const closeReceiptsModalBtn = document.getElementById('closeReceiptsModalBtn');
const emptyReceiptsMessageEl = document.getElementById('emptyReceiptsMessage');
const receiptStorageErrorEl = document.getElementById('receiptStorageError');
const receiptListEl = document.getElementById('receiptList');
const searchToggleBtn = document.getElementById('searchToggle');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const productCards = document.querySelectorAll('.product-card');
const noResultsEl = document.getElementById('noResults');
const categoryButtons = document.querySelectorAll('.category-card');
let activeCategory = 'all';
const qrScannerButton = document.getElementById('qrScannerButton');
const qrScannerModal = document.getElementById('qrScannerModal');
const closeQrScannerModalBtn = document.getElementById('closeQrScannerModalBtn');
const qrVideo = document.getElementById('qrVideo');
const qrCanvas = document.getElementById('qrCanvas');
const qrStatus = document.getElementById('qrStatus');
const qrImageInput = document.getElementById('qrImageInput');
const adminButton = document.getElementById('adminButton');
const adminModal = document.getElementById('adminModal');
const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminCodeOneInput = document.getElementById('adminCodeOne');
const adminCodeTwoInput = document.getElementById('adminCodeTwo');
const adminLoginErrorEl = document.getElementById('adminLoginError');
const adminOrdersEl = document.getElementById('adminOrders');
const adminOrderCountEl = document.getElementById('adminOrderCount');
const emptyAdminOrdersEl = document.getElementById('emptyAdminOrders');
const adminOrderListEl = document.getElementById('adminOrderList');
const adminMenuButton = document.getElementById('adminMenuButton');
const adminMenuModal = document.getElementById('adminMenuModal');
const closeAdminMenuModalBtn = document.getElementById('closeAdminMenuModalBtn');
const adminMenuCountEl = document.getElementById('adminMenuCount');
const adminMenuListEl = document.getElementById('adminMenuList');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminOrderDetailsModal = document.getElementById('adminOrderDetailsModal');
const adminOrderDetailsEl = document.getElementById('adminOrderDetails');
const closeAdminOrderDetailsBtn = document.getElementById('closeAdminOrderDetailsBtn');

let currentBasePrice = 0;
let quantity = 1;
let selectedSize = '';
const cartItems = [];
let currentVerificationCode = '';
const receiptStorageKey = 'evosReceipts';
const promoCode = 'EVOS77';
const promoDiscountRate = 0.1;
const adminFirstCode = 'admin';
const adminSecondCode = 'admin';
let promoApplied = false;
let receiptStorageAvailable = true;
let adminAuthenticated = false;
let qrStream = null;
let qrScanFrame = 0;
let qrDetector = null;

function loadReceipts() {
    try {
        const savedReceipts = localStorage.getItem(receiptStorageKey);
        if (!savedReceipts) return [];

        const parsedReceipts = JSON.parse(savedReceipts);
        if (!Array.isArray(parsedReceipts) ||
            parsedReceipts.some(receipt => !receipt || typeof receipt.id !== 'string' || !Array.isArray(receipt.items))) {
            throw new Error('Cheklar brauzer xotirasida kutilgan formatda emas.');
        }

        return parsedReceipts;
    } catch (error) {
        receiptStorageAvailable = false;
        console.error('Cheklarni brauzer xotirasidan o‘qib bo‘lmadi:', error);
        return [];
    }
}

let receipts = loadReceipts();

if (searchToggleBtn && searchForm && searchInput) {
    searchToggleBtn.addEventListener('click', () => {
        const isOpen = !searchForm.hidden;
        searchForm.hidden = isOpen;
        searchToggleBtn.setAttribute('aria-expanded', String(!isOpen));

        if (isOpen) {
            searchInput.value = '';
            filterProducts();
        } else {
            searchInput.focus();
        }
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterProducts();
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    });

    searchInput.addEventListener('input', filterProducts);
}

function filterProducts() {
    if (!searchInput || !noResultsEl) return;

    const query = searchInput.value.trim().toLocaleLowerCase('uz-UZ');
    let visibleProducts = 0;

    productCards.forEach((card) => {
        const title = card.querySelector('h3').textContent;
        const titleLower = title.toLocaleLowerCase('uz-UZ');
        let cardCategory = card.dataset.category || '';
        const cardCategories = cardCategory.split(/\s+/).filter(Boolean);

        if (!cardCategory) {
            if (titleLower.includes('lavash')) cardCategory = 'lavash';
            else if (titleLower.includes('hot-dog') || titleLower.includes('hotdog')) cardCategory = 'hotdog';
            else if (titleLower.includes('sandvich') || titleLower.includes('sendvich') || titleLower.includes('tost')) cardCategory = 'sandwich';
            else if (titleLower.includes('kokteyl') || titleLower.includes('cola') || titleLower.includes('sharbat') || titleLower.includes('suv')) cardCategory = 'drink';
            else if (titleLower.includes('fri') || titleLower.includes('kartoshka')) cardCategory = 'potato';
            else if (titleLower.includes('donut') || titleLower.includes('tiramisu') || titleLower.includes('pankeyk')) cardCategory = 'donuts';
            else if (titleLower.includes('shashlik') || titleLower.includes('mastava') || titleLower.includes('palov')) cardCategory = 'shawarma';
            else if (titleLower.includes('gamburger') || titleLower.includes('cheeseburger') || titleLower.includes('burger')) cardCategory = 'chizz';
            else cardCategory = 'new';
        }

        const matchesCategory = activeCategory === 'all'
            || cardCategories.includes(activeCategory)
            || (!cardCategory && activeCategory === 'new');
        const matches = matchesCategory && titleLower.includes(query);
        card.hidden = !matches;

        if (matches) {
            visibleProducts++;
        }
    });

    noResultsEl.hidden = visibleProducts > 0;
}

categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        activeCategory = button.dataset.category || 'all';

        categoryButtons.forEach((categoryButton) => {
            categoryButton.classList.toggle('active', categoryButton === button);
        });

        if (searchInput) {
            searchInput.value = '';
        }

        filterProducts();
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    });
});

function updateCartBadge() {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    if (cartCountEl) {
        cartCountEl.textContent = itemCount;
        cartCountEl.hidden = itemCount === 0;
    }
}

function renderCart() {
    if (!cartItemsEl || !emptyCartMessageEl || !cartTotalEl) return;

    while (cartItemsEl.firstChild) {
        cartItemsEl.removeChild(cartItemsEl.firstChild);
    }

    let subtotal = 0;

    cartItems.forEach((item, index) => {
        subtotal += item.unitPrice * item.quantity;

        const row = document.createElement('div');
        row.className = 'cart-item';

        const info = document.createElement('div');
        info.className = 'cart-item-info';

        const title = document.createElement('h3');
        title.textContent = item.name;
        info.appendChild(title);

        const details = [item.size, ...item.addons].filter(Boolean).join(', ');
        if (details) {
            const detailsEl = document.createElement('p');
            detailsEl.textContent = details;
            info.appendChild(detailsEl);
        }

        const price = document.createElement('p');
        price.textContent = `${(item.unitPrice * item.quantity).toLocaleString('uz-UZ')} so'm`;
        info.appendChild(price);

        const controls = document.createElement('div');
        controls.className = 'cart-item-controls';

        const decreaseButton = document.createElement('button');
        decreaseButton.type = 'button';
        decreaseButton.className = 'cart-quantity-btn';
        decreaseButton.dataset.action = 'decrease';
        decreaseButton.dataset.index = index;
        decreaseButton.setAttribute('aria-label', `${item.name} sonini kamaytirish`);
        decreaseButton.textContent = '−';
        controls.appendChild(decreaseButton);

        const itemQuantity = document.createElement('span');
        itemQuantity.textContent = item.quantity;
        controls.appendChild(itemQuantity);

        const increaseButton = document.createElement('button');
        increaseButton.type = 'button';
        increaseButton.className = 'cart-quantity-btn';
        increaseButton.dataset.action = 'increase';
        increaseButton.dataset.index = index;
        increaseButton.setAttribute('aria-label', `${item.name} sonini oshirish`);
        increaseButton.textContent = '+';
        controls.appendChild(increaseButton);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'cart-remove-btn';
        removeButton.dataset.action = 'remove';
        removeButton.dataset.index = index;
        removeButton.setAttribute('aria-label', `${item.name}ni savatdan o'chirish`);
        removeButton.textContent = 'O‘chirish';
        controls.appendChild(removeButton);

        row.appendChild(info);
        row.appendChild(controls);
        cartItemsEl.appendChild(row);
    });

    emptyCartMessageEl.hidden = cartItems.length > 0;
    cartTotalEl.hidden = cartItems.length === 0;
    if (cartItems.length === 0) {
        promoApplied = false;
        if (promoCodeInput) promoCodeInput.value = '';
        if (promoMessageEl) {
            promoMessageEl.textContent = '';
            promoMessageEl.classList.remove('error');
        }
    }

    const discount = promoApplied ? Math.round(subtotal * promoDiscountRate) : 0;
    const total = subtotal - discount;
    if (cartSubtotalEl) {
        cartSubtotalEl.hidden = cartItems.length === 0;
        cartSubtotalEl.textContent = `Mahsulotlar: ${subtotal.toLocaleString('uz-UZ')} so'm`;
    }
    if (promoDiscountEl) {
        promoDiscountEl.hidden = !promoApplied || cartItems.length === 0;
        promoDiscountEl.textContent = `Chegirma (${promoCode}): −${discount.toLocaleString('uz-UZ')} so'm`;
    }
    cartTotalEl.textContent = `To'lov: ${total.toLocaleString('uz-UZ')} so'm`;
    if (checkoutButton) {
        checkoutButton.hidden = cartItems.length === 0;
    }
    updateCartBadge();
}

function saveReceipts(updatedReceipts) {
    try {
        localStorage.setItem(receiptStorageKey, JSON.stringify(updatedReceipts));
        return true;
    } catch (error) {
        receiptStorageAvailable = false;
        console.error('Cheklarni brauzer xotirasiga saqlab bo‘lmadi:', error);
        return false;
    }
}

function appendReceiptDetails(receipt, container) {
    const title = document.createElement('h3');
    title.textContent = `Chek № ${receipt.id}`;
    container.appendChild(title);

    const date = document.createElement('p');
    date.textContent = `Olingan vaqti: ${new Date(receipt.createdAt).toLocaleString('uz-UZ')}`;
    container.appendChild(date);

    const customer = document.createElement('p');
    customer.textContent = `Mijoz: ${receipt.customerName || '-'}`;
    container.appendChild(customer);

    const phone = document.createElement('p');
    phone.textContent = `Telefon: ${receipt.phone}`;
    container.appendChild(phone);

    const address = document.createElement('p');
    address.textContent = `Manzil: ${receipt.address}`;
    container.appendChild(address);

    const itemsList = document.createElement('ul');
    receipt.items.forEach(item => {
        const listItem = document.createElement('li');
        const options = [item.size, ...(Array.isArray(item.addons) ? item.addons : [])].filter(Boolean).join(', ');
        const details = options ? ` (${options})` : '';
        listItem.textContent =
            `${item.name}${details} × ${item.quantity} — ${(item.unitPrice * item.quantity).toLocaleString('uz-UZ')} so'm`;
        itemsList.appendChild(listItem);
    });
    container.appendChild(itemsList);

    const subtotal = document.createElement('p');
    subtotal.textContent = `Mahsulotlar: ${receipt.subtotal.toLocaleString('uz-UZ')} so'm`;
    container.appendChild(subtotal);

    if (receipt.promoCode) {
        const discount = document.createElement('p');
        discount.textContent =
            `Promo kod ${receipt.promoCode} chegirmasi: −${receipt.discount.toLocaleString('uz-UZ')} so'm`;
        container.appendChild(discount);
    }

    const total = document.createElement('p');
    total.textContent = `Jami to'lov: ${receipt.total.toLocaleString('uz-UZ')} so'm`;
    container.appendChild(total);

    const courierCode = document.createElement('p');
    courierCode.className = 'courier-code';
    courierCode.textContent = `Kuryer kodi: ${receipt.courierCode}`;
    container.appendChild(courierCode);
}

function renderReceiptArchive() {
    if (!receiptListEl || !emptyReceiptsMessageEl || !receiptStorageErrorEl) return;

    while (receiptListEl.firstChild) {
        receiptListEl.removeChild(receiptListEl.firstChild);
    }

    receiptStorageErrorEl.hidden = receiptStorageAvailable;
    emptyReceiptsMessageEl.hidden = !receiptStorageAvailable || receipts.length > 0;
    if (!receiptStorageAvailable) return;

    receipts.forEach(receipt => {
        const receiptCard = document.createElement('article');
        receiptCard.className = 'receipt-card';
        appendReceiptDetails(receipt, receiptCard);
        receiptListEl.appendChild(receiptCard);
    });
}

function renderAdminOrders() {
    if (!adminOrderListEl || !adminOrderCountEl || !emptyAdminOrdersEl) return;

    while (adminOrderListEl.firstChild) {
        adminOrderListEl.removeChild(adminOrderListEl.firstChild);
    }

    const today = new Date();
    const todayOrders = receipts.filter(receipt => {
        const orderDate = new Date(receipt.createdAt);
        return orderDate.getFullYear() === today.getFullYear()
            && orderDate.getMonth() === today.getMonth()
            && orderDate.getDate() === today.getDate();
    });
    const todayTotal = todayOrders.reduce((sum, receipt) => sum + (Number(receipt.total) || 0), 0);

    adminOrderCountEl.textContent =
        `Bugun: ${todayOrders.length} buyurtma | Jami: ${todayTotal.toLocaleString('uz-UZ')} so'm`;
    emptyAdminOrdersEl.hidden = receipts.length > 0;
    receipts.forEach((receipt, index) => {
        const orderCard = document.createElement('article');
        orderCard.className = 'admin-order-card';

        const summary = document.createElement('div');
        summary.className = 'admin-order-summary';

        const title = document.createElement('h3');
        title.textContent = `Buyurtma № ${receipt.id}`;
        summary.appendChild(title);

        const date = document.createElement('p');
        const orderDate = new Date(receipt.createdAt);
        const isToday = orderDate.toDateString() === new Date().toDateString();
        date.textContent =
            `${isToday ? 'Bugun — ' : ''}Vaqti: ${orderDate.toLocaleString('uz-UZ')}`;
        summary.appendChild(date);

        const customer = document.createElement('p');
        customer.textContent = `Mijoz: ${receipt.customerName || '-'}`;
        summary.appendChild(customer);

        const phone = document.createElement('p');
        phone.textContent = `Telefon: ${receipt.phone}`;
        summary.appendChild(phone);

        const address = document.createElement('p');
        address.textContent = `Manzil: ${receipt.address}`;
        summary.appendChild(address);

        const itemsHeading = document.createElement('p');
        itemsHeading.textContent = 'Olingan mahsulotlar:';
        summary.appendChild(itemsHeading);

        const itemsList = document.createElement('ul');
        receipt.items.forEach(item => {
            const listItem = document.createElement('li');
            const lineTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
            listItem.textContent =
                `${item.name} — ${item.quantity} ta — ${lineTotal.toLocaleString('uz-UZ')} so'm`;
            itemsList.appendChild(listItem);
        });
        summary.appendChild(itemsList);

        const total = document.createElement('p');
        total.textContent = `Jami: ${receipt.total.toLocaleString('uz-UZ')} so'm`;
        summary.appendChild(total);

        const detailsButton = document.createElement('button');
        detailsButton.type = 'button';
        detailsButton.className = 'checkout-button';
        detailsButton.dataset.orderIndex = index;
        detailsButton.textContent = 'Tafsilotlarini ko‘rish';
        detailsButton.setAttribute('aria-label', `${receipt.id} buyurtmasini ko‘rish`);

        orderCard.appendChild(summary);
        orderCard.appendChild(detailsButton);
        adminOrderListEl.appendChild(orderCard);
    });

}

function renderAdminMenu() {
    if (!adminMenuListEl || !adminMenuCountEl) return;

    while (adminMenuListEl.firstChild) {
        adminMenuListEl.removeChild(adminMenuListEl.firstChild);
    }

    adminMenuCountEl.textContent = `(${productCards.length} ta)`;
    productCards.forEach(card => {
        const title = card.querySelector('h3');
        const price = card.querySelector('p');
        if (!title || !price) return;

        const item = document.createElement('p');
        item.className = 'admin-menu-item';
        item.textContent = `${title.textContent.trim()} — ${price.textContent.trim()}`;
        adminMenuListEl.appendChild(item);
    });
}

function closeAdminOrderDetails() {
    if (adminOrderDetailsModal) adminOrderDetailsModal.classList.remove('active');
}

function closeAdminMenuModal() {
    if (adminMenuModal) adminMenuModal.classList.remove('active');
}

function closeAdminModal() {
    if (adminModal) adminModal.classList.remove('active');
    adminAuthenticated = false;
    if (adminLoginForm) adminLoginForm.hidden = false;
    if (adminOrdersEl) adminOrdersEl.hidden = true;
    closeAdminOrderDetails();
    closeAdminMenuModal();
    if (adminLoginErrorEl) adminLoginErrorEl.hidden = true;
    if (adminCodeOneInput) adminCodeOneInput.value = '';
    if (adminCodeTwoInput) adminCodeTwoInput.value = '';
}

if (adminButton && adminModal && adminLoginForm && adminOrdersEl) {
    adminButton.addEventListener('click', () => {
        adminModal.classList.add('active');
        adminLoginForm.hidden = false;
        adminOrdersEl.hidden = true;
        if (adminLoginErrorEl) adminLoginErrorEl.hidden = true;
        if (adminCodeOneInput) adminCodeOneInput.focus();
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstCode = adminCodeOneInput.value.trim();
        const secondCode = adminCodeTwoInput.value.trim();

        if (firstCode !== adminFirstCode || secondCode !== adminSecondCode) {
            adminLoginErrorEl.hidden = false;
            return;
        }

        adminAuthenticated = true;
        adminLoginErrorEl.hidden = true;
        adminCodeOneInput.value = '';
        adminCodeTwoInput.value = '';
        adminLoginForm.hidden = true;
        adminOrdersEl.hidden = false;
        renderAdminOrders();

        const adminPageUrl = new URL('admin.html', window.location.href);
        adminPageUrl.searchParams.set('authenticated', '1');
        const adminWindow = window.open(
            adminPageUrl.href,
            'EVOSAdminPanel',
            'popup=yes,width=920,height=720,noopener=yes'
        );

        if (adminWindow) {
            closeAdminModal();
            adminWindow.focus();
        }
    });

    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) closeAdminModal();
    });
}

if (closeAdminModalBtn) {
    closeAdminModalBtn.addEventListener('click', closeAdminModal);
}

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', closeAdminModal);
}

if (adminOrderListEl && adminOrderDetailsModal && adminOrderDetailsEl) {
    adminOrderListEl.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-order-index]');
        if (!button) return;

        const receipt = receipts[Number(button.dataset.orderIndex)];
        if (!receipt) return;

        while (adminOrderDetailsEl.firstChild) {
            adminOrderDetailsEl.removeChild(adminOrderDetailsEl.firstChild);
        }
        appendReceiptDetails(receipt, adminOrderDetailsEl);
        adminOrderDetailsModal.classList.add('active');
    });

    adminOrderDetailsModal.addEventListener('click', (e) => {
        if (e.target === adminOrderDetailsModal) closeAdminOrderDetails();
    });
}

if (closeAdminOrderDetailsBtn) {
    closeAdminOrderDetailsBtn.addEventListener('click', closeAdminOrderDetails);
}

if (adminMenuButton && adminMenuModal) {
    adminMenuButton.addEventListener('click', () => {
        renderAdminMenu();
        adminMenuModal.classList.add('active');
    });

    adminMenuModal.addEventListener('click', (e) => {
        if (e.target === adminMenuModal) closeAdminMenuModal();
    });
}

if (closeAdminMenuModalBtn) {
    closeAdminMenuModalBtn.addEventListener('click', closeAdminMenuModal);
}

window.addEventListener('storage', (e) => {
    if (e.key === receiptStorageKey) {
        receipts = loadReceipts();
        if (adminAuthenticated) renderAdminOrders();
    }
});

if (applyPromoButton && promoCodeInput && promoMessageEl) {
    applyPromoButton.addEventListener('click', () => {
        const enteredCode = promoCodeInput.value.trim().toUpperCase();
        promoMessageEl.classList.remove('error');

        if (cartItems.length === 0) {
            promoMessageEl.textContent = 'Avval savatga taom qo‘shing.';
        } else if (enteredCode === promoCode) {
            promoApplied = true;
            promoMessageEl.textContent = 'Promo kod qo‘llandi: 10% chegirma.';
            renderCart();
        } else {
            promoMessageEl.textContent = 'Promo kod noto‘g‘ri.';
            promoMessageEl.classList.add('error');
        }
    });
}

function extractPromoCode(rawValue) {
    const raw = String(rawValue || '').trim();
    if (!raw) return '';

    if (raw.toUpperCase().includes(promoCode)) return promoCode;

    try {
        const url = new URL(raw, window.location.href);
        const promo = url.searchParams.get('promo') || url.searchParams.get('coupon');
        if (promo && promo.trim().toUpperCase() === promoCode) return promoCode;
    } catch (error) {
        // Oddiy matn yoki promo kodi sifatida tekshiriladi.
    }

    return '';
}

function applyScannedPromo(rawValue) {
    const detectedCode = extractPromoCode(rawValue);
    if (!detectedCode) {
        if (qrStatus) qrStatus.textContent = 'QR kod noto‘g‘ri. EVOS77 promo QR kodini skanerlang.';
        if (promoMessageEl) {
            promoMessageEl.textContent = 'QR kod noto‘g‘ri.';
            promoMessageEl.classList.add('error');
        }
        return false;
    }

    promoApplied = true;
    if (promoCodeInput) promoCodeInput.value = promoCode;
    if (promoMessageEl) {
        promoMessageEl.textContent = 'QR promo kod qo‘llandi: 10% chegirma.';
        promoMessageEl.classList.remove('error');
    }
    if (qrStatus) qrStatus.textContent = 'EVOS77 QR kodi topildi. 10% chegirma qo‘llandi!';
    renderCart();
    return true;
}

function closeQrScannerModal() {
    if (qrScanFrame) {
        cancelAnimationFrame(qrScanFrame);
        qrScanFrame = 0;
    }
    if (qrStream) {
        qrStream.getTracks().forEach(track => track.stop());
        qrStream = null;
    }
    if (qrScannerModal) qrScannerModal.classList.remove('active');
}

async function scanQrFrame() {
    if (!qrDetector || !qrVideo || qrVideo.readyState < 2) {
        qrScanFrame = requestAnimationFrame(scanQrFrame);
        return;
    }

    try {
        const codes = await qrDetector.detect(qrVideo);
        if (codes.length && applyScannedPromo(codes[0].rawValue)) {
            setTimeout(closeQrScannerModal, 900);
            return;
        }
    } catch (error) {
        console.warn('QR kodni o‘qib bo‘lmadi:', error);
    }

    qrScanFrame = requestAnimationFrame(scanQrFrame);
}

async function startQrScanner() {
    if (!qrScannerModal) return;

    qrScannerModal.classList.add('active');
    if (qrStatus) qrStatus.textContent = 'Kamera ishga tushirilmoqda...';

    if (!('BarcodeDetector' in window)) {
        if (qrStatus) {
            qrStatus.textContent =
                'Bu brauzer kameradan QR skanerni qo‘llab-quvvatlamaydi. QR rasmini yuklang.';
        }
        return;
    }

    try {
        qrDetector = new BarcodeDetector({ formats: ['qr_code'] });
        qrStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } }
        });
        if (qrVideo) {
            qrVideo.srcObject = qrStream;
            await qrVideo.play();
        }
        if (qrStatus) qrStatus.textContent = 'QR kodni kameraga qarating.';
        qrScanFrame = requestAnimationFrame(scanQrFrame);
    } catch (error) {
        console.error('QR kamera ochilmadi:', error);
        if (qrStatus) {
            qrStatus.textContent =
                'Kameraga ruxsat berilmadi yoki mavjud emas. QR rasmini yuklashingiz mumkin.';
        }
    }
}

if (qrScannerButton) {
    qrScannerButton.addEventListener('click', startQrScanner);
}

if (closeQrScannerModalBtn) {
    closeQrScannerModalBtn.addEventListener('click', closeQrScannerModal);
}

if (qrScannerModal) {
    qrScannerModal.addEventListener('click', (e) => {
        if (e.target === qrScannerModal) closeQrScannerModal();
    });
}

if (qrImageInput) {
    qrImageInput.addEventListener('change', async () => {
        const file = qrImageInput.files && qrImageInput.files[0];
        if (!file) return;

        if (!('BarcodeDetector' in window)) {
            if (qrStatus) qrStatus.textContent = 'Bu brauzer QR rasmni skanerlashni qo‘llamaydi.';
            return;
        }

        try {
            qrDetector = qrDetector || new BarcodeDetector({ formats: ['qr_code'] });
            const imageBitmap = await createImageBitmap(file);
            const codes = await qrDetector.detect(imageBitmap);
            if (!codes.length || !applyScannedPromo(codes[0].rawValue)) {
                if (qrStatus) qrStatus.textContent = 'Rasmdan EVOS77 QR kodi topilmadi.';
            } else {
                setTimeout(closeQrScannerModal, 900);
            }
        } catch (error) {
            console.error('QR rasmni o‘qib bo‘lmadi:', error);
            if (qrStatus) qrStatus.textContent = 'QR rasmni o‘qib bo‘lmadi.';
        }
    });
}

const promoFromUrl =
    new URL(window.location.href).searchParams.get('promo') ||
    new URL(window.location.href).searchParams.get('coupon') ||
    window.location.hash.replace(/^#/, '');
if (promoFromUrl) {
    applyScannedPromo(promoFromUrl);
}

function resetCheckout() {
    currentVerificationCode = '';
    if (cartSummaryEl) cartSummaryEl.hidden = false;
    if (deliveryForm) deliveryForm.hidden = true;
    if (verificationForm) verificationForm.hidden = true;
    if (orderSuccessEl) orderSuccessEl.hidden = true;
    if (orderErrorEl) {
        orderErrorEl.hidden = true;
        orderErrorEl.textContent = '';
    }
    if (customerNameInput) customerNameInput.value = '';
    if (phoneNumberInput) phoneNumberInput.value = '';
    if (deliveryAddressInput) deliveryAddressInput.value = '';
    if (verificationCodeInput) verificationCodeInput.value = '';
    if (verificationErrorEl) {
        verificationErrorEl.hidden = true;
        verificationErrorEl.textContent = '';
    }
}

function closeCartModal() {
    if (cartModal) {
        cartModal.classList.remove('active');
    }

    if (cartButton) {
        cartButton.setAttribute('aria-expanded', 'false');
    }
}

function closeReceiptsModal() {
    if (receiptsModal) {
        receiptsModal.classList.remove('active');
    }
}

if (cartButton && cartModal) {
    cartButton.addEventListener('click', () => {
        if (cartItems.length > 0 && orderSuccessEl && !orderSuccessEl.hidden) {
            resetCheckout();
        }
        renderCart();
        cartModal.classList.add('active');
        cartButton.setAttribute('aria-expanded', 'true');
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
}

if (closeCartModalBtn) {
    closeCartModalBtn.addEventListener('click', closeCartModal);
}

if (receiptsButton && receiptsModal) {
    receiptsButton.addEventListener('click', () => {
        renderReceiptArchive();
        receiptsModal.classList.add('active');
    });

    receiptsModal.addEventListener('click', (e) => {
        if (e.target === receiptsModal) {
            closeReceiptsModal();
        }
    });
}

if (closeReceiptsModalBtn) {
    closeReceiptsModalBtn.addEventListener('click', closeReceiptsModal);
}

if (checkoutButton && deliveryForm && cartSummaryEl) {
    checkoutButton.addEventListener('click', () => {
        cartSummaryEl.hidden = true;
        deliveryForm.hidden = false;
        phoneNumberInput.focus();
    });
}

if (deliveryForm && verificationForm) {
    deliveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentVerificationCode = String(Math.floor(100000 + Math.random() * 900000));
        verificationNoticeEl.textContent =
            `Demo kodi: ${currentVerificationCode}. Haqiqiy SMS yuborilmadi.`;
        verificationErrorEl.hidden = true;
        deliveryForm.hidden = true;
        verificationForm.hidden = false;
        verificationCodeInput.focus();
    });
}

if (backToCartBtn && cartSummaryEl && deliveryForm) {
    backToCartBtn.addEventListener('click', () => {
        deliveryForm.hidden = true;
        cartSummaryEl.hidden = false;
    });
}

if (backToDeliveryBtn && deliveryForm && verificationForm) {
    backToDeliveryBtn.addEventListener('click', () => {
        verificationForm.hidden = true;
        deliveryForm.hidden = false;
        verificationErrorEl.hidden = true;
    });
}

if (verificationForm) {
    verificationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (verificationCodeInput.value.trim() !== currentVerificationCode) {
            verificationErrorEl.textContent = 'Kod noto‘g‘ri. Qaytadan tekshirib kiriting.';
            verificationErrorEl.hidden = false;
            return;
        }

        const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const discount = promoApplied ? Math.round(subtotal * promoDiscountRate) : 0;
        const courierCode = String(Math.floor(100000 + Math.random() * 900000));
        const receipt = {
            id: `EVOS-${Date.now().toString(36).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            customerName: customerNameInput ? customerNameInput.value.trim() : '',
            phone: phoneNumberInput.value.trim(),
            address: deliveryAddressInput.value.trim(),
            items: cartItems.map(item => ({
                name: item.name,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                size: item.size,
                addons: [...item.addons]
            })),
            promoCode: promoApplied ? promoCode : '',
            subtotal,
            discount,
            total: subtotal - discount,
            courierCode
        };
        const updatedReceipts = [receipt, ...receipts];
        if (!saveReceipts(updatedReceipts)) {
            orderErrorEl.textContent = 'Chekni saqlab bo‘lmadi. Brauzer xotirasi sozlamalarini tekshiring.';
            orderErrorEl.hidden = false;
            return;
        }

        receipts = updatedReceipts;
        while (latestReceiptEl.firstChild) {
            latestReceiptEl.removeChild(latestReceiptEl.firstChild);
        }
        appendReceiptDetails(receipt, latestReceiptEl);
        orderErrorEl.hidden = true;
        cartItems.length = 0;
        renderCart();
        verificationForm.hidden = true;
        orderSuccessEl.hidden = false;
        currentVerificationCode = '';
    });
}

if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const index = Number(button.dataset.index);
        const item = cartItems[index];
        if (!item) return;

        if (button.dataset.action === 'increase') {
            item.quantity++;
        } else if (button.dataset.action === 'decrease') {
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                cartItems.splice(index, 1);
            }
        } else if (button.dataset.action === 'remove') {
            cartItems.splice(index, 1);
        }

        renderCart();
    });
}

// ==========================================
// MODALNI OCHISH
// ==========================================

function openModal(title, price, imgsrc, desc) {

    if (!modal) return;

    modalTitle.textContent = title;
    currentBasePrice = Number(price) || 0;

    modalImg.src = imgsrc;
    modalImg.alt = title;

    modalDesc.textContent = desc;

    quantity = 1;

    if (qtyValueEl) {
        qtyValueEl.textContent = quantity;
    }

    selectedSize = '';

    sizeButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    addonCheckboxes.forEach(cb => {
        cb.checked = false;
    });

    modal.classList.add('active');

    updateTotalPrice();
}

// ==========================================
// MODALNI YOPISH
// ==========================================

function closeModal() {
    if (modal) {
        modal.classList.remove('active');
    }
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// ESC TUGMASI ORQALI YOPISH

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeCartModal();
        closeReceiptsModal();
        closeQrScannerModal();
        if (adminMenuModal && adminMenuModal.classList.contains('active')) {
            closeAdminMenuModal();
        } else if (adminOrderDetailsModal && adminOrderDetailsModal.classList.contains('active')) {
            closeAdminOrderDetails();
        } else {
            closeAdminModal();
        }
    }
});

// ==========================================
// UMUMIY NARXNI HISOBLASH
// ==========================================

function updateTotalPrice() {

    let addonsSum = 0;

    addonCheckboxes.forEach(cb => {

        if (cb.checked) {
            addonsSum += Number(cb.value) || 0;
        }

    });

    const finalPrice =
        (currentBasePrice + addonsSum) * quantity;

    if (totalPriceEl) {
        totalPriceEl.textContent =
            finalPrice.toLocaleString('uz-UZ') + " so'm";
    }
}

// ==========================================
// O'LCHAM TANLASH
// ==========================================

sizeButtons.forEach(btn => {

    btn.addEventListener('click', () => {

        sizeButtons.forEach(b => {
            b.classList.remove('active');
        });

        btn.classList.add('active');

        selectedSize = btn.dataset.size || btn.textContent.trim();

        updateTotalPrice();

    });

});

// ==========================================
// QO'SHIMCHA MAHSULOTLAR
// ==========================================

addonCheckboxes.forEach(cb => {

    cb.addEventListener('change', () => {
        updateTotalPrice();
    });

});

// ==========================================
// MAHSULOT MIQDORINI KAMAYTIRISH
// ==========================================

if (decreaseQtyBtn) {

    decreaseQtyBtn.addEventListener('click', () => {

        if (quantity > 1) {

            quantity--;

            qtyValueEl.textContent = quantity;

            updateTotalPrice();

        }

    });

}

// ==========================================
// MAHSULOT MIQDORINI OSHIRISH
// ==========================================

if (increaseQtyBtn) {

    increaseQtyBtn.addEventListener('click', () => {

        quantity++;

        if (qtyValueEl) {
            qtyValueEl.textContent = quantity;
        }

        updateTotalPrice();

    });

}

// ==========================================
// SAVATGA QO'SHISH
// ==========================================

if (addToCartBtn) {

    addToCartBtn.addEventListener('click', () => {
        const addons = Array.from(addonCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.parentElement.textContent.trim());
        const addonsPrice = Array.from(addonCheckboxes)
            .filter(cb => cb.checked)
            .reduce((total, cb) => total + (Number(cb.value) || 0), 0);

        cartItems.push({
            name: modalTitle ? modalTitle.textContent : 'Mahsulot',
            unitPrice: currentBasePrice + addonsPrice,
            size: selectedSize,
            addons,
            quantity
        });

        renderCart();
        closeModal();

    });

}
