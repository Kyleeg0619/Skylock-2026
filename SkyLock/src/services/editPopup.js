import { AngelRegistry } from '../data/AngelRegistry.js';
import { IslandRegistry } from '../data/IslandRegistry.js';

// --- Populate Edit Popup ---
export function populateEditPopup() {
    const angelSelect1 = document.getElementById('angelSelect1');
    const angelSelect2 = document.getElementById('angelSelect2');
    const islandsGrid = document.getElementById('islandsGrid');

    if (!angelSelect1 || !angelSelect2 || !islandsGrid) {
        console.warn('Edit popup elements not found');
        return;
    }

    const ownedAngels = window.gameCustomization?.ownedAngels || ['dog-1'];
    const ownedIslands = window.gameCustomization?.ownedIslands || ['starter-island'];
    const selectedSlot = window.gameCustomization.selectedSlot;
    const currentAngels = window.gameCustomization.angelLayout?.[selectedSlot] || [null, null];

    console.log('Populating edit popup for slot:', selectedSlot);

    // Clear existing items
    angelSelect1.innerHTML = '';
    angelSelect2.innerHTML = '';
    islandsGrid.innerHTML = '';

    // Populate dropdowns
    populateAngelDropdown(angelSelect1, ownedAngels, currentAngels[0]);
    populateAngelDropdown(angelSelect2, ownedAngels, currentAngels[1]);

    // Dropdown change listeners
    angelSelect1.onchange = (e) => {
        window.gameCustomization.selectedAngel1 = e.target.value === 'none' ? null : e.target.value;
        console.log('Selected angel 1:', window.gameCustomization.selectedAngel1);
    };

    angelSelect2.onchange = (e) => {
        window.gameCustomization.selectedAngel2 = e.target.value === 'none' ? null : e.target.value;
        console.log('Selected angel 2:', window.gameCustomization.selectedAngel2);
    };

    // Populate islands grid
    Object.entries(IslandRegistry).forEach(([key, island]) => {
        const isOwned = ownedIslands.includes(key);
        const isCurrentIsland = window.gameCustomization.islandLayout[selectedSlot] === key;

        const div = document.createElement('div');
        div.className = `selection-item${isOwned ? '' : ' locked'}${isCurrentIsland ? ' selected' : ''}`;
        div.dataset.type = 'island';
        div.dataset.id = key;

        div.innerHTML = `
            <img src="assets/islands/${island.sprite}" alt="${island.name}">
            ${isOwned ? '' : '<i class="bi bi-lock-fill"></i>'}
            <span>${isOwned ? island.name : '???'}</span>
        `;

        islandsGrid.appendChild(div);
    });

    // Attach island listeners
    attachIslandSelectionListeners();
}

function populateAngelDropdown(selectElement, ownedAngels, currentValue) {
    // None option
    const noneOption = document.createElement('option');
    noneOption.value = 'none';
    noneOption.textContent = '-- None --';
    if (!currentValue || currentValue === 'none') {
        noneOption.selected = true;
    }
    selectElement.appendChild(noneOption);

    // Group by rarity
    const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
    const angelsByRarity = {};

    Object.entries(AngelRegistry).forEach(([key, angel]) => {
        const rarity = angel.rarity || 'common';
        if (!angelsByRarity[rarity]) angelsByRarity[rarity] = [];
        angelsByRarity[rarity].push({ key, ...angel });
    });

    rarityOrder.forEach(rarity => {
        const angels = angelsByRarity[rarity];
        if (!angels || angels.length === 0) return;

        const optgroup = document.createElement('optgroup');
        optgroup.label = rarity.charAt(0).toUpperCase() + rarity.slice(1);

        angels.forEach(angel => {
            const isOwned = ownedAngels.includes(angel.key);

            const option = document.createElement('option');
            option.value = angel.key;
            option.textContent = isOwned ? angel.name : '??? (Locked)';
            option.disabled = !isOwned;

            if (angel.key === currentValue) option.selected = true;

            optgroup.appendChild(option);
        });

        selectElement.appendChild(optgroup);
    });
}

function attachIslandSelectionListeners() {
    document.querySelectorAll('#islandsGrid .selection-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();

            if (item.classList.contains('locked')) {
                item.style.animation = 'shake 0.3s ease';
                setTimeout(() => item.style.animation = '', 300);
                return;
            }

            document.querySelectorAll('#islandsGrid .selection-item').forEach(i => {
                i.classList.remove('selected');
            });

            item.classList.add('selected');
            window.gameCustomization.selectedIsland = item.dataset.id;
            console.log('Selected island:', item.dataset.id);
        });
    });
}

// --- Init Edit Popup ---
export function initEditPopup(game) {
    const editBtn = document.getElementById('editBtn');
    const editPopup = document.getElementById('editPopup');

    if (!editBtn || !editPopup) {
        console.warn('Edit button or popup not found');
        return;
    }

    // Toggle popup
    editBtn.addEventListener('click', (e) => {
        if (e.target.closest('#editPopup')) return;

        if (window.gameCustomization.selectedSlot === null) {
            showNoSelectionWarning();
            return;
        }

        populateEditPopup();

        const isHidden = editPopup.style.display === 'none' || editPopup.style.display === '';
        editPopup.style.display = isHidden ? 'block' : 'none';

        // Update title
        const slotNames = ['Top-Left', 'Top-Right', 'Bottom-Left', 'Bottom-Right'];
        const popupTitle = editPopup.querySelector('h2');
        if (popupTitle && window.gameCustomization.selectedSlot !== null) {
            popupTitle.textContent = `Edit ${slotNames[window.gameCustomization.selectedSlot]} Island`;
        }

        // Close other popups
        const settingsPopup = document.getElementById('settingsPopup');
        const infoPopup = document.getElementById('infoPopup');
        if (settingsPopup) settingsPopup.style.display = 'none';
        if (infoPopup) infoPopup.style.display = 'none';
    });

    // Confirm button
    const confirmBtn = document.getElementById('editConfirmBtn');
    if (confirmBtn) {
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const angel1Value = document.getElementById('angelSelect1')?.value;
            const angel2Value = document.getElementById('angelSelect2')?.value;

            console.log('=== CONFIRM CLICKED ===');
            console.log('Slot:', window.gameCustomization.selectedSlot);
            console.log('Island:', window.gameCustomization.selectedIsland);
            console.log('Angel 1:', angel1Value);
            console.log('Angel 2:', angel2Value);

            if (window.gameCustomization.selectedSlot === null || 
                window.gameCustomization.selectedSlot === undefined) {
                editPopup.style.display = 'none';
                return;
            }

            const slotToSwap = window.gameCustomization.selectedSlot;

            if (game && game.events) {
                game.events.emit('customizationChanged', {
                    selectedIsland: window.gameCustomization.selectedIsland,
                    selectedAngel1: angel1Value === 'none' ? null : angel1Value,
                    selectedAngel2: angel2Value === 'none' ? null : angel2Value,
                    selectedSlot: slotToSwap
                });
                console.log('Event emitted!');
            }

            // Reset
            window.gameCustomization.selectedIsland = null;
            window.gameCustomization.selectedAngel1 = undefined;
            window.gameCustomization.selectedAngel2 = undefined;

            editPopup.style.display = 'none';
        });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!editBtn.contains(e.target) && !editPopup.contains(e.target)) {
            editPopup.style.display = 'none';
        }
    });

    editPopup.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// --- Warning ---
export function showNoSelectionWarning() {
    let warning = document.getElementById('noSelectionWarning');
    
    if (!warning) {
        warning = document.createElement('div');
        warning.id = 'noSelectionWarning';
        warning.innerHTML = `<p>⚠️ Double-click an island first to select it for editing!</p>`;
        warning.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #6654c0;
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            z-index: 100;
            font-family: Arial, sans-serif;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        document.getElementById('game-container').appendChild(warning);
    } else {
        warning.style.display = 'block';
    }

    setTimeout(() => { warning.style.display = 'none'; }, 2000);
}