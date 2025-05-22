const fileInput = document.getElementById('input-file');
const imageContainer = document.querySelector('.image-container');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const encodingButtons = document.querySelectorAll('input[name="encodingGroup"]');
const foundColorsContainer = document.querySelector('.found-colors');
const moreColorsButton = document.getElementById('more-colors-button');
const allColorsButton = document.getElementById('all-colors-button');

const rgbSorted = new Array();
let lastColorNum = 0;

encodingButtons.forEach(encoding => {
    encoding.addEventListener('change', () => {
        if (!encoding.checked) return;

        if (encoding.value === 'rgb') {
            foundColorsContainer.innerHTML = '';
            updateColorPanel(0, lastColorNum);
        } else if (encoding.value === 'hex') {
            foundColorsContainer.innerHTML = '';
            updateColorPanel(0, lastColorNum);
        }
    });
});

moreColorsButton.addEventListener('click', () => {
    let colorsAdded = updateColorPanel(lastColorNum + 1, lastColorNum + 10);
    if (colorsAdded) document.querySelector('h2').innerText = `Sorted ${lastColorNum + 1} colors`;
});

allColorsButton.addEventListener('click', () => {
    let colorsAdded = updateColorPanel(lastColorNum + 1, rgbSorted.length - 1);
    if (colorsAdded) document.querySelector('h2').innerText = `Sorted ${rgbSorted.length} colors`;
});

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
        alert('Error retrieving file path');
        return;
    }

    try {
        const img = await loadImageFromFile(file);

        document.querySelector('h2').innerText = 'Top 10 colors';
        foundColorsContainer.innerHTML = '';
        rgbSorted.splice(0, rgbSorted.length);

        imageContainer.innerHTML = '';
        imageContainer.appendChild(img);

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        fillInColorMap(imageData.data);
        
    } catch (error) {
        alert('Error loading the image. Try again.');
    }
});

function fillInColorMap(data) {
    const rgbMap = new Map();

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const color = `${r}-${g}-${b}`;

        if (rgbMap.has(color)) {
            rgbMap.set(color, rgbMap.get(color) + 1);
        } else {
            rgbMap.set(color, 1);
        }
    }

    const sorted = Array.from(rgbMap.entries()).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([colors, count]) => {
        const currentColor = colors.split('-').map(Number);

        rgbSorted.push(currentColor);
    });

    updateColorPanel(0, 9);
}

function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;

            img.src = e.target.result;
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

function rgbToHex(r, g, b) {
    return (
        '#' + [r, g, b]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
    );
}

function updateColorPanel(colorsNumStart, colorsNumEnd) {
    let colorsAdded = false;

    if (encodingButtons[0].checked) colorsAdded = drawRGBColors(colorsNumStart, colorsNumEnd);
    else if (encodingButtons[1].checked) colorsAdded = drawHEXColors(colorsNumStart, colorsNumEnd);

    return colorsAdded;
}

function drawRGBColors(colorsNumStart, colorsNumEnd) {
    if (colorsNumStart >= rgbSorted.length - 1) return false;

    colorsNumEnd = Math.min(colorsNumEnd, rgbSorted.length - 1);

    for (let i = colorsNumStart; i <= colorsNumEnd; ++i) {
        const [r, g, b] = rgbSorted[i];

        foundColorsContainer.insertAdjacentHTML('beforeend', `
            <div class="found-color-wrapper">
                <div class="color-block" 
                    style="background-color: rgb(${r}, ${g}, ${b})"></div>
                <p class="color-encoding">${i + 1}. rgb(${r}, ${g}, ${b})</p>
            </div>
        `);
    }

    lastColorNum = colorsNumEnd;

    return true;
}

function drawHEXColors(colorsNumStart, colorsNumEnd) {
    if (colorsNumStart == rgbSorted.length - 1) return false;

    colorsNumEnd = Math.min(colorsNumEnd, rgbSorted.length - 1);

    for (let i = colorsNumStart; i <= colorsNumEnd; ++i) {
        const [r, g, b] = rgbSorted[i];

        let hexColor = rgbToHex(r, g, b);

        foundColorsContainer.insertAdjacentHTML('beforeend', `
            <div class="found-color-wrapper">
                <div class="color-block" 
                    style="background-color: ${hexColor}"></div>
                <p class="color-encoding">${i + 1}. ${hexColor}</p>
            </div>
        `);
    }

    lastColorNum = colorsNumEnd;

    return true;
}