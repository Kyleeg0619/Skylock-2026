import {getAuth,signOut} from "firebase/auth";

export function initUI() {
    if (window.__uiInitialized) return;
    window.__uiInitialized = true;

    // --- DOM elements ---
    const infoBtn = document.getElementById('infoBtn');
    const infoPage = document.getElementById('infoPopup');

    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPage = document.getElementById('settingsPopup');
    const settingsForm = document.getElementById('settingsForm');

    // --- INFO BUTTON ---
    infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.__infoOpened = true; // scene can react if needed
        infoPage.style.display =
            infoPage.style.display === 'none' ? 'block' : 'none';
    });

    // prevent closing when clicking inside popup
    infoPage.addEventListener('click', (e) => e.stopPropagation());


    // Toggle popup
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.__settingsOpened = true; // scene will handle populating
        settingsPage.style.display =
            settingsPage.style.display === 'none' ? 'block' : 'none';
    });

    // Form submit
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.__settingsSubmitted = true; // scene will handle saving
        settingsPage.style.display = 'none';
    });

    // Prevent bubbling
    settingsPage.addEventListener('click', (e) => e.stopPropagation());

    // Click outside
    document.addEventListener('click', () => {
        settingsPage.style.display = 'none';
    });

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            window.location.reload(window.location.href);
        }).catch((error) => {
            console.error(error);
        });
    });
}

export function showUI({ settings, home, shop, edit, info, coins }) {
    document.getElementById('settingsBtn').style.display = settings ? 'block' : 'none';
    document.getElementById('homeBtn').style.display = home ? 'block' : 'none';
    document.getElementById('shopBtn').style.display = shop ? 'block' : 'none';
    document.getElementById('editBtn').style.display = edit ? 'block' : 'none';
    document.getElementById('infoBtn').style.display = info ? 'block' : 'none';
    document.getElementById('coinQty').style.display = coins ? 'flex' : 'none';
}